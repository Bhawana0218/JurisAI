import { prisma } from "@/lib/prisma";
import { OrgRole } from "@prisma/client";
import { eventBus } from "../../event-bus/event-bus";
import { logger } from "../../observability/logging/logger";

interface SamlConfig {
  entryPoint: string;
  issuer: string;
  cert: string;
  audience?: string;
}

interface OidcConfig {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  jwksUrl: string;
}

type SsoProvider = "saml" | "oidc" | "google_workspace" | "azure_ad" | "okta" | "custom";

class EnterpriseSsoService {
  async createConnection(params: {
    provider: SsoProvider;
    organizationId: string;
    userId: string;
    clientId: string;
    clientSecret?: string;
    issuerUrl?: string;
    domains: string[];
    metadataUrl?: string;
    certificate?: string;
    defaultRole?: OrgRole;
  }) {
    const connection = await prisma.ssoConnection.create({
      data: {
        provider: params.provider,
        clientId: params.clientId,
        clientSecret: params.clientSecret,
        issuerUrl: params.issuerUrl,
        domains: params.domains,
        metadataUrl: params.metadataUrl,
        certificate: params.certificate,
        defaultRole: params.defaultRole || "MEMBER",
        organizationId: params.organizationId,
        userId: params.userId,
      },
    });

    await eventBus.publish({
      type: "sso.connection.created",
      source: "jurisai:sso",
      data: { connectionId: connection.id, provider: params.provider, organizationId: params.organizationId },
      metadata: { userId: params.userId, organizationId: params.organizationId, version: 1 },
    });

    return connection;
  }

  async authenticate(provider: string, token: string, organizationId: string): Promise<{ user: any; isNewUser: boolean } | null> {
    const connection = await prisma.ssoConnection.findUnique({
      where: { provider_organizationId: { provider, organizationId } },
    });

    if (!connection || !connection.enabled) return null;

    const userInfo = await this.validateToken(connection, token);
    if (!userInfo) return null;

    const email = userInfo.email;
    if (!email) return null;

    const domain = email.split("@")[1];
    if (!connection.domains.includes(domain) && !connection.domains.includes("*")) return null;

    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: userInfo.name || email.split("@")[0],
          image: userInfo.picture,
          password: crypto.randomUUID(),
          isVerified: true,
        },
      });
      isNewUser = true;
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: user.id } },
    });

    if (!existingMember) {
      await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: user.id,
          role: connection.defaultRole,
        },
      });
    }

    return { user, isNewUser };
  }

  private async validateToken(connection: any, token: string): Promise<{ email: string; name?: string; picture?: string } | null> {
    try {
      if (connection.provider === "oidc" || connection.provider === "azure_ad" || connection.provider === "google_workspace" || connection.provider === "okta") {
        const response = await fetch(connection.issuerUrl?.replace("/.well-known/openid-configuration", "") + "/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return null;
        const data = await response.json();
        return {
          email: data.email || data.preferred_username,
          name: data.name || data.given_name,
          picture: data.picture,
        };
      }

      return null;
    } catch (error) {
      logger.error("[SSO] Token validation failed", { error });
      return null;
    }
  }

  async getConnections(organizationId: string) {
    return prisma.ssoConnection.findMany({
      where: { organizationId },
      select: { id: true, provider: true, domains: true, enabled: true, createdAt: true },
    });
  }

  async toggleConnection(id: string, enabled: boolean) {
    return prisma.ssoConnection.update({
      where: { id },
      data: { enabled },
    });
  }

  async deleteConnection(id: string) {
    return prisma.ssoConnection.delete({ where: { id } });
  }
}

export const enterpriseSso = new EnterpriseSsoService();
