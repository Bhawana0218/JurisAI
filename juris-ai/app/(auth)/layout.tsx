import type { ReactNode } from "react";

// Auth layout — renders login and register pages as-is.
// No session check here. Reasons:
// 1. auth() throws JWTSessionError when a stale cookie exists (old secret),
//    which crashes the page even inside try/catch in some Next.js versions.
// 2. Redirecting logged-in users away from /login is a nice-to-have, not
//    required — the dashboard layout already protects /dashboard/* routes.
// 3. Keeping this layout minimal guarantees /login and /register always render.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
