import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import AuthSessionProvider from "@/components/providers/session-provider";

// Dashboard layout:
// 1. Server-side auth check — unauthenticated users go to /login.
// 2. Wraps children in SessionProvider so dashboard client components
//    (useSession, signOut buttons, etc.) have access to session context.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthSessionProvider>
  );
}
