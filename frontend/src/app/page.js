// Skeleton page only (Step 1 — no business logic yet).
// This exists purely to prove the frontend and backend can actually talk to
// each other before any real feature gets built on top.

export default async function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  let health = null;
  let error = null;

  try {
    const res = await fetch(`${backendUrl}/api/health/`, { cache: "no-store" });
    health = await res.json();
  } catch (e) {
    error = e.message;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          NagDrishti AI — scaffold check
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Step 1: running skeleton only. This page just confirms the frontend can reach Django.
        </p>

        <div className="mt-6 rounded-lg bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Backend status
          </p>
          {error ? (
            <p className="mt-1 text-sm font-medium text-red-600">
              Could not reach backend at {backendUrl}: {error}
            </p>
          ) : (
            <pre className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
