import { prisma } from "@/lib/prisma";
import { OrgRole } from "@prisma/client";

type Permission = string;
type Resource = string;

const ROLE_PERMISSIONS: Record<OrgRole, Permission[]> = {
  OWNER: ["*"],
  ADMIN: [
    "organization:read",
    "organization:write",
    "organization:delete",
    "organization:settings",
    "members:read",
    "members:invite",
    "members:remove",
    "members:roles",
    "billing:read",
    "billing:write",
    "api:keys:manage",
    "api:keys:read",
    "webhooks:manage",
    "webhooks:read",
    "audit:read",
    "audit:export",
    "governance:manage",
    "governance:read",
    "workflows:manage",
    "workflows:execute",
    "agents:install",
    "agents:manage",
    "analytics:read",
    "analytics:export",
    "sso:manage",
    "plugins:manage",
    "ai:models:configure",
    "ai:usage:read",
  ],
  MEMBER: [
    "organization:read",
    "members:read",
    "chats:create",
    "chats:read",
    "chats:write",
    "documents:upload",
    "documents:read",
    "documents:analyze",
    "cases:create",
    "cases:read",
    "cases:write",
    "workflows:execute",
    "workflows:read",
    "analytics:read",
    "agents:use",
    "webhooks:read",
    "ai:chat",
    "ai:research",
  ],
  VIEWER: [
    "organization:read",
    "chats:read",
    "documents:read",
    "cases:read",
    "analytics:read",
    "workflows:read",
  ],
};

class EnterpriseRbac {
  async checkPermission(userId: string, organizationId: string, permission: Permission): Promise<boolean> {
    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });

    if (!member) return false;

    const permissions = ROLE_PERMISSIONS[member.role];
    return permissions.includes("*") || permissions.includes(permission);
  }

  async requirePermission(userId: string, organizationId: string, permission: Permission): Promise<void> {
    const hasPermission = await this.checkPermission(userId, organizationId, permission);
    if (!hasPermission) {
      throw new Error(`Insufficient permissions: ${permission} required`);
    }
  }

  async getUserRole(userId: string, organizationId: string): Promise<OrgRole | null> {
    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    return member?.role || null;
  }

  async updateUserRole(userId: string, organizationId: string, newRole: OrgRole, actorId: string): Promise<void> {
    const actorRole = await this.getUserRole(actorId, organizationId);
    if (!actorRole || (actorRole !== "OWNER" && actorRole !== "ADMIN")) {
      throw new Error("Only owners and admins can change roles");
    }

    if (newRole === "OWNER" && actorRole !== "OWNER") {
      throw new Error("Only owners can assign owner role");
    }

    await prisma.organizationMember.update({
      where: { organizationId_userId: { organizationId, userId } },
      data: { role: newRole },
    });
  }

  async getMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { joinedAt: "asc" },
    });
  }

  async inviteMember(organizationId: string, email: string, role: OrgRole, invitedBy: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const existing = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: user.id } },
    });

    if (existing) throw new Error("User is already a member");

    await prisma.organizationMember.create({
      data: { organizationId, userId: user.id, role },
    });
  }

  async removeMember(organizationId: string, userId: string, actorId: string): Promise<void> {
    const actorRole = await this.getUserRole(actorId, organizationId);
    if (!actorRole || (actorRole !== "OWNER" && actorRole !== "ADMIN")) {
      throw new Error("Only owners and admins can remove members");
    }

    const targetRole = await this.getUserRole(userId, organizationId);
    if (targetRole === "OWNER") {
      throw new Error("Cannot remove the owner");
    }

    await prisma.organizationMember.delete({
      where: { organizationId_userId: { organizationId, userId } },
    });
  }

  async getPermissionsForRole(role: OrgRole): Promise<Permission[]> {
    return ROLE_PERMISSIONS[role];
  }

  async getEffectivePermissions(userId: string, organizationId: string): Promise<Permission[]> {
    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });

    if (!member) return [];
    const permissions = ROLE_PERMISSIONS[member.role];

    if (permissions.includes("*")) return ["*"];
    return permissions;
  }
}

export const enterpriseRbac = new EnterpriseRbac();
