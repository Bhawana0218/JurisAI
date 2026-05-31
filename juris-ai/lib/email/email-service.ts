type EmailTemplate = "welcome" | "invite" | "payment-failed" | "usage-alert" | "workflow-completed" | "magic-link" | "password-reset";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

class EmailService {
  private from = process.env.EMAIL_FROM || "noreply@jurisai.io";

  async send(template: EmailTemplate, to: string, params: Record<string, string>): Promise<void> {
    const html = this.render(template, params);
    if (!html) return;

    await this.dispatch({ to, subject: this.subjectFor(template), html });
  }

  async sendCustom(payload: EmailPayload): Promise<void> {
    await this.dispatch(payload);
  }

  private async dispatch(payload: EmailPayload): Promise<void> {
    if (process.env.RESEND_API_KEY) {
      await this.sendViaResend(payload);
    } else if (process.env.SENDGRID_API_KEY) {
      await this.sendViaSendGrid(payload);
    } else {
      console.log(`[Email] Would send: ${payload.subject} to ${payload.to}`);
    }
  }

  private async sendViaResend(payload: EmailPayload) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY!}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: payload.to, subject: payload.subject, html: payload.html }),
    });
    if (!res.ok) console.error("[Email] Resend error:", await res.text());
  }

  private async sendViaSendGrid(payload: EmailPayload) {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY!}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: this.from },
        subject: payload.subject,
        content: [{ type: "text/html", value: payload.html }],
      }),
    });
    if (!res.ok) console.error("[Email] SendGrid error:", await res.text());
  }

  private render(template: EmailTemplate, params: Record<string, string>): string {
    const templates: Record<EmailTemplate, string> = {
      welcome: `<h1>Welcome to JurisAI!</h1><p>Hi {{name}},</p><p>Your account is ready. <a href="{{url}}">Get started</a></p>`,
      invite: `<h1>You've been invited</h1><p>{{inviter}} invited you to join {{org}} on JurisAI. <a href="{{url}}">Accept invite</a></p>`,
      "payment-failed": `<h1>Payment Failed</h1><p>Your subscription payment failed. <a href="{{url}}">Update billing</a></p>`,
      "usage-alert": `<h1>Usage Alert</h1><p>You've used {{percent}}% of your {{metric}} limit.</p>`,
      "workflow-completed": `<h1>Workflow Complete</h1><p>Your workflow "{{name}}" completed successfully. <a href="{{url}}">View result</a></p>`,
      "magic-link": `<h1>Sign in to JurisAI</h1><p><a href="{{url}}">Click here to sign in</a>. This link expires in 15 minutes.</p>`,
      "password-reset": `<h1>Reset Password</h1><p><a href="{{url}}">Click here to reset your password</a>. This link expires in 1 hour.</p>`,
    };

    const raw = templates[template];
    if (!raw) return "";

    return Object.entries(params).reduce((acc, [key, val]) => acc.replace(new RegExp(`{{${key}}}`, "g"), val), raw);
  }

  private subjectFor(template: EmailTemplate): string {
    const subjects: Record<EmailTemplate, string> = {
      welcome: "Welcome to JurisAI!",
      invite: "You've been invited to join a workspace",
      "payment-failed": "Payment Failed - Update Billing",
      "usage-alert": "JurisAI Usage Alert",
      "workflow-completed": "Workflow Completed Successfully",
      "magic-link": "Sign in to JurisAI",
      "password-reset": "Reset Your JurisAI Password",
    };
    return subjects[template] || "Notification from JurisAI";
  }
}

export const emailService = new EmailService();
