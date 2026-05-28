import Link from "next/link";

const checks = [
  "Next.js App Router operativo",
  "API backend disponible en /api/health",
  "Workers aislados fuera de React",
  "Arquitectura documentada en /docs",
  "Makefile con comandos front/back/build/test"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-5xl rounded-2xl border border-orange-200 bg-orange-50/40 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">Tumbfolio</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Base técnica T-01 ejecutable</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
          Scaffold Full TypeScript para construir el pipeline de notebooks ejecutados hacia Presentation Model, editor, render HTML y exportes derivados. Esta base no ejecuta notebooks.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white" href="/editor">
            Abrir editor base
          </Link>
          <Link className="rounded-xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700" href="/present">
            Abrir presentación base
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
        {checks.map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
            <span className="font-semibold text-orange-700">OK</span> — {item}
          </div>
        ))}
      </section>
    </main>
  );
}
