terraform {
  required_version = ">= 1.6"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  backend "gcs" {
    bucket = "jurisai-terraform-state"
    prefix = "production"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

resource "google_container_cluster" "jurisai" {
  name                     = "jurisai-cluster-${var.environment}"
  location                 = var.region
  remove_default_node_pool = true
  initial_node_count       = 1
  networking_mode          = "VPC_NATIVE"

  release_channel {
    channel = "REGULAR"
  }

  addons_config {
    http_load_balancing { enabled = true }
    horizontal_pod_autoscaling { enabled = true }
    network_policy_config { disabled = true }
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "10.0.0.0/28"
  }

  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = data.google_ip_ranges.cloud_run.cidr_blocks[0]
      display_name = "Cloud Run"
    }
  }

  maintenance_policy {
    recurring_window {
      start_time = "2024-01-01T03:00:00Z"
      end_time   = "2024-01-01T05:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SA,SU"
    }
  }
}

resource "google_container_node_pool" "general" {
  name       = "general-pool"
  cluster    = google_container_cluster.jurisai.name
  location   = var.region
  node_count = var.environment == "production" ? 3 : 2

  node_config {
    machine_type = var.environment == "production" ? "e2-standard-4" : "e2-standard-2"
    disk_size_gb = 100
    disk_type    = "pd-standard"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
    workload_meta_config {
      mode = "GKE_METADATA"
    }
    labels = {
      environment = var.environment
      pool        = "general"
    }
    tags = ["jurisai", var.environment]
  }

  autoscaling {
    min_node_count = var.environment == "production" ? 3 : 1
    max_node_count = var.environment == "production" ? 20 : 5
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

resource "google_container_node_pool" "gpu" {
  name       = "gpu-pool"
  cluster    = google_container_cluster.jurisai.name
  location   = var.region
  node_count = 0

  node_config {
    machine_type = "g2-standard-4"
    disk_size_gb = 200
    disk_type    = "pd-ssd"
    guest_accelerator {
      type  = "nvidia-l4"
      count = 1
    }
    gvnic { enabled = true }
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
    labels = {
      environment = var.environment
      pool        = "gpu"
    }
    tags = ["jurisai", var.environment, "gpu"]
  }

  autoscaling {
    min_node_count = 0
    max_node_count = 5
  }
}

resource "google_compute_global_address" "jurisai" {
  name = "jurisai-ip-${var.environment}"
}

resource "google_artifact_registry_repository" "jurisai" {
  location      = var.region
  repository_id = "jurisai-${var.environment}"
  description   = "Docker repository for JurisAI ${var.environment}"
  format        = "DOCKER"
}

resource "google_cloud_scheduler_job" "webhook_retry" {
  name        = "webhook-retry-${var.environment}"
  description = "Retry failed webhook deliveries"
  schedule    = "*/5 * * * *"
  time_zone   = "UTC"
  http_target {
    http_method = "POST"
    uri         = "https://api.jurisai.io/api/v1/webhooks/retry"
    headers     = { "Authorization" : "Bearer ${var.internal_jobs_secret}" }
  }
}

resource "google_cloud_scheduler_job" "memory_consolidation" {
  name        = "memory-consolidation-${var.environment}"
  description = "Consolidate short-term AI memory to long-term"
  schedule    = "0 */6 * * *"
  time_zone   = "UTC"
  http_target {
    http_method = "POST"
    uri         = "https://api.jurisai.io/api/v1/system/memory/consolidate"
    headers     = { "Authorization" : "Bearer ${var.internal_jobs_secret}" }
  }
}

resource "google_cloud_scheduler_job" "usage_alerts" {
  name        = "usage-alerts-${var.environment}"
  description = "Check and send usage threshold alerts"
  schedule    = "*/15 * * * *"
  time_zone   = "UTC"
  http_target {
    http_method = "POST"
    uri         = "https://api.jurisai.io/api/v1/system/usage/check-alerts"
    headers     = { "Authorization" : "Bearer ${var.internal_jobs_secret}" }
  }
}

output "cluster_endpoint" {
  value = google_container_cluster.jurisai.endpoint
}

output "artifact_registry" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.jurisai.repository_id}"
}
