output "cluster_name" {
  value = google_container_cluster.jurisai.name
}

output "cluster_location" {
  value = google_container_cluster.jurisai.location
}

output "cluster_endpoint" {
  value     = google_container_cluster.jurisai.endpoint
  sensitive = true
}

output "artifact_registry_repository" {
  value = google_artifact_registry_repository.jurisai.id
}

output "node_pools" {
  value = {
    general = google_container_node_pool.general.name
    gpu     = google_container_node_pool.gpu.name
  }
}

output "static_ip" {
  value = google_compute_global_address.jurisai.address
}
