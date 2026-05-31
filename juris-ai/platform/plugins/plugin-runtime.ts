import { prisma } from "@/lib/prisma";
import { logger } from "../observability/logging/logger";

type PluginHook = {
  name: string;
  handler: (context: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

type PluginManifest = {
  id: string;
  name: string;
  version: string;
  entryPoint: string;
  hooks: string[];
  permissions: string[];
  configSchema: Record<string, unknown>;
};

class PluginRuntime {
  private plugins: Map<string, PluginManifest> = new Map();
  private hooks: Map<string, Set<PluginHook>> = new Map();

  async loadPlugin(pluginId: string): Promise<void> {
    const plugin = await prisma.pluginRegistry.findUnique({ where: { id: pluginId } });
    if (!plugin || plugin.status !== "APPROVED") throw new Error("Plugin not available");

    this.plugins.set(pluginId, {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      entryPoint: plugin.entryPoint,
      hooks: plugin.hooks,
      permissions: Object.keys(plugin.permissions || {}),
      configSchema: plugin.configSchema as Record<string, unknown>,
    });

    logger.info(`[Plugin] Loaded: ${plugin.name} v${plugin.version}`);
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const manifest = this.plugins.get(pluginId);
    if (manifest) {
      for (const hookName of manifest.hooks) {
        const hookSet = this.hooks.get(hookName);
        if (hookSet) {
          for (const hook of hookSet) {
            if ((hook as any).pluginId === pluginId) {
              hookSet.delete(hook);
            }
          }
        }
      }
      this.plugins.delete(pluginId);
      logger.info(`[Plugin] Unloaded: ${manifest.name}`);
    }
  }

  registerHook(pluginId: string, hookName: string, handler: PluginHook["handler"]): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, new Set());
    }
    this.hooks.get(hookName)!.add({
      name: `${pluginId}:${hookName}`,
      handler,
    } as any);
  }

  async executeHook(hookName: string, context: Record<string, unknown>): Promise<Record<string, unknown>> {
    const hooks = this.hooks.get(hookName);
    if (!hooks || hooks.size === 0) return context;

    let result = { ...context };
    for (const hook of hooks) {
      try {
        result = { ...result, ...(await hook.handler(result)) };
      } catch (error) {
        logger.error(`[Plugin] Hook ${hookName} failed`, { error, plugin: hook.name });
      }
    }
    return result;
  }

  async installPlugin(pluginName: string, organizationId: string, config?: Record<string, unknown>): Promise<void> {
    const plugin = await prisma.pluginRegistry.findUnique({ where: { name: pluginName } });
    if (!plugin) throw new Error(`Plugin "${pluginName}" not found`);

    await prisma.pluginInstallation.create({
      data: {
        agentId: plugin.id,
        organizationId,
        userId: "system",
        configuration: (config || {}) as any,
        enabled: true,
      },
    });

    await this.loadPlugin(plugin.id);

    logger.info(`[Plugin] Installed ${pluginName} in ${organizationId}`);
  }

  async uninstallPlugin(pluginName: string, organizationId: string): Promise<void> {
    const plugin = await prisma.pluginRegistry.findUnique({ where: { name: pluginName } });
    if (plugin) {
      await prisma.pluginInstallation.deleteMany({
        where: { agentId: plugin.id, organizationId },
      });
      await this.unloadPlugin(plugin.id);
    }
  }

  async listAvailablePlugins(): Promise<PluginManifest[]> {
    const plugins = await prisma.pluginRegistry.findMany({
      where: { status: "APPROVED" },
      orderBy: { downloads: "desc" },
    });

    return plugins.map((p) => ({
      id: p.id,
      name: p.name,
      version: p.version,
      entryPoint: p.entryPoint,
      hooks: p.hooks,
      permissions: Object.keys(p.permissions || {}),
      configSchema: p.configSchema as Record<string, unknown>,
    }));
  }

  async getInstalledPlugins(organizationId: string): Promise<{ manifest: PluginManifest; config: any; enabled: boolean }[]> {
    const installations = await prisma.pluginInstallation.findMany({
      where: { organizationId },
      include: { agent: true },
    });

    return installations
      .filter((i) => this.plugins.has(i.agentId))
      .map((i) => ({
        manifest: this.plugins.get(i.agentId)!,
        config: i.configuration,
        enabled: i.enabled,
      }));
  }
}

export const pluginRuntime = new PluginRuntime();
