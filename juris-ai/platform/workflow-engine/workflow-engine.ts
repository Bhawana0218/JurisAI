import { prisma } from "@/lib/prisma";
import { WorkflowStepType, WorkflowStatus, ExecutionStatus } from "@prisma/client";
import { eventBus } from "../event-bus/event-bus";
import { logger } from "../observability/logging/logger";

type StepConfig = {
  id: string;
  name: string;
  type: WorkflowStepType;
  order: number;
  config: Record<string, unknown>;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  retryConfig?: { maxRetries: number; backoffMs: number };
  condition?: string;
  timeoutMs?: number;
  agentId?: string;
};

class WorkflowEngine {
  async createWorkflow(params: {
    name: string;
    description?: string;
    userId: string;
    organizationId?: string;
    steps: StepConfig[];
    trigger?: Record<string, unknown>;
    variables?: Record<string, unknown>;
    errorHandling?: Record<string, unknown>;
    timeoutMs?: number;
  }) {
    const workflow = await prisma.workflow.create({
      data: {
        name: params.name,
        description: params.description,
        status: "DRAFT" as WorkflowStatus,
        userId: params.userId,
        organizationId: params.organizationId,
        trigger: (params.trigger || {}) as any,
        variables: (params.variables || {}) as any,
        errorHandling: (params.errorHandling || {}) as any,
        timeoutMs: params.timeoutMs || 300000,
        steps: {
          create: params.steps.map((s) => ({
            name: s.name,
            type: s.type,
            order: s.order,
            config: s.config as any,
            inputMapping: s.inputMapping as any,
            outputMapping: s.outputMapping as any,
            retryConfig: s.retryConfig as any,
            condition: s.condition,
            timeoutMs: s.timeoutMs,
            agentId: s.agentId || "",
          })),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return workflow;
  }

  async executeWorkflow(workflowId: string, input?: Record<string, unknown>, userId?: string): Promise<string> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    if (!workflow) throw new Error("Workflow not found");
    if (workflow.status !== "ACTIVE") throw new Error("Workflow is not active");

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        status: "PENDING" as ExecutionStatus,
        input: (input || {}) as any,
        totalSteps: workflow.steps.length,
        userId,
        organizationId: workflow.organizationId,
        trigger: "manual",
      },
    });

    await eventBus.publish({
      type: "workflow.started",
      source: "jurisai:workflow-engine",
      data: { executionId: execution.id, workflowId, totalSteps: workflow.steps.length },
      metadata: { userId, organizationId: workflow.organizationId || undefined, version: 1 },
    });

    this.processExecution(execution.id, workflow.steps, input || {}).catch((error) => {
      logger.error("[Workflow] Execution failed", { executionId: execution.id, error: error.message });
    });

    return execution.id;
  }

  private async processExecution(executionId: string, steps: any[], initialInput: Record<string, unknown>): Promise<void> {
    const context: Record<string, unknown> = { ...initialInput };
    let failed = false;

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: "RUNNING" as ExecutionStatus, startedAt: new Date() },
    });

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: { currentStep: i },
      });

      const stepInput = this.applyMapping(step.inputMapping, context);
      const stepResult = await this.executeStep(step, stepInput);

      await prisma.workflowStepResult.create({
        data: {
          executionId,
          stepId: step.id,
          stepName: step.name,
          stepType: step.type,
          order: step.order,
          status: stepResult.error ? "FAILED" : "COMPLETED",
          input: stepInput as any,
          output: (stepResult.output || {}) as any,
          error: stepResult.error ? { message: stepResult.error } : undefined,
          startedAt: stepResult.startedAt,
          completedAt: stepResult.completedAt,
          durationMs: stepResult.durationMs,
          retryAttempt: stepResult.retryAttempt || 0,
        },
      });

      await eventBus.publish({
        type: "workflow.step.completed",
        source: "jurisai:workflow-engine",
        data: {
          executionId,
          stepName: step.name,
          stepType: step.type,
          status: stepResult.error ? "failed" : "completed",
          durationMs: stepResult.durationMs,
        },
        metadata: { version: 1 },
      });

      if (stepResult.error) {
        failed = true;
        break;
      }

      if (stepResult.output) {
        const mapped = this.applyMapping(step.outputMapping, stepResult.output as Record<string, unknown>);
        Object.assign(context, mapped);
      }

      if (step.condition && !this.evaluateCondition(step.condition, context)) {
        break;
      }
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: failed ? ("FAILED" as ExecutionStatus) : ("COMPLETED" as ExecutionStatus),
        output: context as any,
        completedAt: new Date(),
        durationMs: Math.round(performance.now() - 0),
      },
    });

    await eventBus.publish({
      type: failed ? "workflow.failed" : "workflow.completed",
      source: "jurisai:workflow-engine",
      data: { executionId, status: failed ? "failed" : "completed" },
      metadata: { version: 1 },
    });
  }

  private async executeStep(step: any, input: Record<string, unknown>): Promise<{
    output?: unknown;
    error?: string;
    startedAt?: Date;
    completedAt?: Date;
    durationMs?: number;
    retryAttempt?: number;
  }> {
    const startedAt = new Date();
    const maxRetries = step.retryConfig?.maxRetries || 1;
    const timeoutMs = step.timeoutMs || 60000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.runStepHandler(step.type, input, step.config, timeoutMs);
        const completedAt = new Date();
        return {
          output: result,
          startedAt,
          completedAt,
          durationMs: completedAt.getTime() - startedAt.getTime(),
          retryAttempt: attempt,
        };
      } catch (error: any) {
        if (attempt < maxRetries - 1) {
          const backoff = step.retryConfig?.backoffMs || 1000;
          await new Promise((r) => setTimeout(r, backoff * Math.pow(2, attempt)));
        } else {
          return {
            error: error.message,
            startedAt,
            completedAt: new Date(),
            durationMs: Date.now() - startedAt.getTime(),
            retryAttempt: attempt,
          };
        }
      }
    }

    return { error: "Max retries exceeded", startedAt, completedAt: new Date() };
  }

  private async runStepHandler(type: WorkflowStepType, input: Record<string, unknown>, config: Record<string, unknown>, timeoutMs: number): Promise<unknown> {
    switch (type) {
      case "AI_AGENT":
        return this.handleAiAgentStep(input, config);
      case "CONDITION":
        return this.handleConditionStep(input, config);
      case "TRANSFORM":
        return this.handleTransformStep(input, config);
      case "API_CALL":
        return this.handleApiCallStep(input, config, timeoutMs);
      case "HUMAN_REVIEW":
        return this.handleHumanReviewStep(input, config);
      case "WEBHOOK":
        return this.handleWebhookStep(input, config, timeoutMs);
      case "DELAY":
        return this.handleDelayStep(input, config);
      case "SUB_WORKFLOW":
        return this.handleSubWorkflowStep(input, config);
      case "NOTIFICATION":
        return this.handleNotificationStep(input, config);
      case "CODE_EXECUTION":
        return this.handleCodeExecutionStep(input, config, timeoutMs);
      default:
        throw new Error(`Unknown step type: ${type}`);
    }
  }

  private async handleAiAgentStep(input: Record<string, unknown>, config: Record<string, unknown>): Promise<unknown> {
    const { generateText } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");
    const agentType = (config.agentType as string) || "GENERAL";
    const systemPrompt = (config.systemPrompt as string) || "You are a helpful legal AI assistant.";

    const result = await generateText({
      model: openai((config.model as string) || "gpt-4.1-mini"),
      system: systemPrompt,
      messages: [{ role: "user", content: JSON.stringify(input) }],
      maxOutputTokens: (config.maxTokens as number) || 2000,
    });

    return { result: result.text, usage: result.usage };
  }

  private async handleConditionStep(input: Record<string, unknown>, config: Record<string, unknown>): Promise<unknown> {
    const field = config.field as string;
    const operator = config.operator as string;
    const value = config.value;

    const actualValue = this.getNestedValue(input, field);
    let matched = false;

    switch (operator) {
      case "equals": matched = actualValue === value; break;
      case "not_equals": matched = actualValue !== value; break;
      case "contains": matched = String(actualValue || "").includes(String(value)); break;
      case "gt": matched = Number(actualValue) > Number(value); break;
      case "gte": matched = Number(actualValue) >= Number(value); break;
      case "lt": matched = Number(actualValue) < Number(value); break;
      case "lte": matched = Number(actualValue) <= Number(value); break;
      case "exists": matched = actualValue != null; break;
      case "regex": matched = new RegExp(String(value)).test(String(actualValue)); break;
      default: matched = false;
    }

    return { matched, condition: { field, operator, value }, actualValue };
  }

  private async handleTransformStep(input: Record<string, unknown>, config: Record<string, unknown>): Promise<unknown> {
    const mapping = config.mapping as Record<string, string>;
    if (!mapping) return input;

    const output: Record<string, unknown> = {};
    for (const [targetKey, sourcePath] of Object.entries(mapping)) {
      output[targetKey] = this.getNestedValue(input, sourcePath);
    }

    return output;
  }

  private async handleApiCallStep(input: Record<string, unknown>, config: Record<string, unknown>, timeoutMs: number): Promise<unknown> {
    const url = config.url as string;
    const method = (config.method as string) || "POST";
    const headers = (config.headers as Record<string, string>) || {};

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: method !== "GET" ? JSON.stringify(input) : undefined,
        signal: controller.signal,
      });
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  private async handleHumanReviewStep(input: Record<string, unknown>, config: Record<string, unknown>): Promise<unknown> {
    // Human review creates a pending review task; returns immediately
    return { status: "pending_review", input, reviewers: config.reviewers || [], message: "Awaiting human review" };
  }

  private async handleWebhookStep(input: Record<string, unknown>, config: Record<string, unknown>, timeoutMs: number): Promise<unknown> {
    const { webhookEngine } = await import("../webhooks/webhook-engine");
    const url = config.url as string;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(timeoutMs),
    });
    return await response.json();
  }

  private async handleDelayStep(_input: Record<string, unknown>, config: Record<string, unknown>): Promise<unknown> {
    const durationMs = (config.durationMs as number) || 1000;
    await new Promise((r) => setTimeout(r, durationMs));
    return { delayed: true, durationMs };
  }

  private async handleSubWorkflowStep(input: Record<string, unknown>, config: Record<string, unknown>): Promise<unknown> {
    const subWorkflowId = config.workflowId as string;
    if (!subWorkflowId) throw new Error("Sub-workflow ID required");
    return this.executeWorkflow(subWorkflowId, input as Record<string, unknown>);
  }

  private async handleNotificationStep(input: Record<string, unknown>, config: Record<string, unknown>): Promise<unknown> {
    const channel = config.channel as string;
    const message = config.message as string;
    logger.info(`[Workflow] Notification via ${channel}: ${message}`, { input });
    return { notified: true, channel };
  }

  private async handleCodeExecutionStep(input: Record<string, unknown>, config: Record<string, unknown>, timeoutMs: number): Promise<unknown> {
    const code = config.code as string;
    if (!code) throw new Error("Code execution requires code");
    const fn = new Function("input", code) as (input: unknown) => unknown;
    return fn(input);
  }

  private applyMapping(mapping: Record<string, string> | undefined | null, context: Record<string, unknown>): Record<string, unknown> {
    if (!mapping) return { ...context };
    const result: Record<string, unknown> = {};
    for (const [targetKey, sourcePath] of Object.entries(mapping)) {
      result[targetKey] = this.getNestedValue(context, sourcePath);
    }
    return result;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce((acc: any, part) => (acc != null ? acc[part] : undefined), obj);
  }

  private evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
    try {
      const keys = Object.keys(context);
      const values = Object.values(context);
      return new Function(...keys, `return ${condition}`)(...values);
    } catch {
      return true;
    }
  }

  // -- Public API methods --

  async getExecution(executionId: string) {
    return prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        stepResults: { orderBy: { order: "asc" } },
        workflow: { select: { name: true, description: true } },
      },
    });
  }

  async listExecutions(workflowId: string, limit = 20, offset = 0) {
    return prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async cancelExecution(executionId: string) {
    return prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: "CANCELLED" as ExecutionStatus, completedAt: new Date() },
    });
  }

  async activateWorkflow(workflowId: string) {
    return prisma.workflow.update({
      where: { id: workflowId },
      data: { status: "ACTIVE" as WorkflowStatus },
    });
  }

  async listWorkflows(organizationId: string, status?: WorkflowStatus) {
    return prisma.workflow.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      include: { _count: { select: { executions: true, steps: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }
}

export const workflowEngine = new WorkflowEngine();
