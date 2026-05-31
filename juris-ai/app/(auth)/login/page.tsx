import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050d1a] px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-[#162d58]" />
        <div className="mx-auto h-6 w-40 animate-pulse rounded-lg bg-[#162d58]" />
        <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-8 space-y-4">
          <div className="h-10 animate-pulse rounded-xl bg-[#162d58]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#162d58]" />
          <div className="h-11 animate-pulse rounded-xl bg-[#1e3a70]" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
