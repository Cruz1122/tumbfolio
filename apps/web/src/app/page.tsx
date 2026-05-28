import Link from "next/link";
import { ApiHealthCard } from "@/components/ApiHealthCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white p-8 text-gray-900">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">T-01 scaffold</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight">Tumbfolio</h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Frontend Next.js separado del backend NestJS. La app web consume API; no aloja parser, storage ni export jobs.
        </p>

        <div className="mt-8 flex gap-3">
          <Link className="rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white" href="/editor">
            Abrir editor
          </Link>
          <Link className="rounded-xl border border-gray-300 px-4 py-2 font-semibold" href="/present">
            Presentar
          </Link>
        </div>

        <div className="mt-8 max-w-md">
          <ApiHealthCard />
        </div>
      </section>
    </main>
  );
}
