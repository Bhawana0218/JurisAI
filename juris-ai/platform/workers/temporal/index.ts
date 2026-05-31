import { prisma } from "@/lib/prisma";
import { workflowEngine } from "../../workflow-engine/workflow-engine";
import { aiRuntime } from "../../ai-runtime/ai-runtime";
import { logger } from "../../observability/logging/logger";

type WorkflowTask = {
  executionId: string;
  workflowId: string;
  taskType: "execute_workflow" | "execute_step" | "retry_step" | "timeout_handler";
  payload: any;
};

class TemporalWorker {
  private running = false;
  private pollInterval = 1000;

  async start(): Promise<void> {
    this.running = true;
    logger.info("[TemporalWorker] Starting...");

    while (this.running) {
      try {
        const pendingExecutions = await prisma.workflowExecution.findMany({
          where: { status: "PENDING" },
          include: { workflow: { include: { steps: { orderBy: { order: "asc" } } } } },
          take: 10,
        });

        for (const execution of pendingExecutions) {
          this.processExecution(execution).catch((error) => {
            logger.error("[TemporalWorker] Execution processing failed", {
              executionId: execution.id,
              error: error.message,
            });
          });
        }

        await this.sleep(this.pollInterval);
      } catch (error: any) {
        logger.error("[TemporalWorker] Poll cycle failed", { error: error.message });
        await this.sleep(5000);
      }
    }
  }

  private async processExecution(execution: any): Promise<void> {
    logger.info(`[TemporalWorker] Processing execution ${execution.id}`);
    await workflowEngine.executeWorkflow(execution.workflowId, execution.input || {}, execution.userId || undefined);
  }

  async stop(): Promise<void> {
    this.running = false;
    logger.info("[TemporalWorker] Stopped");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const worker = new TemporalWorker();

worker.start().catch((error) => {
  logger.error("[TemporalWorker] Fatal error", { error: error.message });
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await worker.stop();
  process.exit(0);
});
