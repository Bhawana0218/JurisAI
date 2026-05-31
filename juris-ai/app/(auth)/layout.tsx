import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Auth layout: renders login/register pages.
// - If the user is already authenticated, send them straight to the dashboard.
// - Does NOT wrap children in SessionProvider — auth pages don't need session
//   context and the dynamic SessionProvider (ssr:false) would cause a blank
//   flash before hydration.
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard/chat");
  }

  return <>{children}</>;
}
