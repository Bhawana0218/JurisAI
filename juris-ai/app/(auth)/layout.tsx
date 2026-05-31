import type { ReactNode } from "react";

// Auth layout — intentionally minimal.
// No auth() check here: if auth() throws (misconfigured secret, trustHost, etc.)
// the entire route group crashes and login/register pages go blank.
// Instead, the dashboard layout handles the "must be logged in" redirect,
// and login-form.tsx handles the "already logged in" case after signIn resolves.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
