"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// Dynamically import SessionProvider to guarantee it never runs on the server.
const SessionProvider = dynamic(
  () => import("next-auth/react").then((mod) => mod.SessionProvider),
  { ssr: false }
);

export default function AuthSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
