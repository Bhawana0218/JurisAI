export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          JurisAI
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Your AI-powered legal assistant for Indian citizens. Get help with
          cybercrime, FIR processes, consumer rights, and more.
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="/login"
            className="flex h-11 items-center justify-center rounded-full bg-black px-6 text-white text-sm font-medium transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Get Started
          </a>
          <a
            href="/register"
            className="flex h-11 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            Create Account
          </a>
        </div>
      </main>
    </div>
  );
}
