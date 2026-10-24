export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          The Bill
        </h1>
        <p className="text-lg text-zinc-400">
          A budget-constrained lineup optimizer for festival and venue promoters, grounded in Qloo&apos;s taste graph.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Core engine initializing &bull; Phase 0 scaffold</span>
        </div>
      </div>
    </main>
  );
}
