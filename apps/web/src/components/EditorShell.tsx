export function EditorShell() {
  return (
    <main className="grid min-h-screen grid-cols-[260px_1fr_320px] bg-white text-gray-900">
      <aside className="border-r border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Slides</p>
        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm">
          Slide 1 — placeholder
        </div>
      </aside>
      <section className="p-8">
        <div className="mx-auto aspect-video max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">Preview</p>
          <h1 className="mt-6 text-4xl font-bold">Tumbfolio editor base</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Esta pantalla consume la API NestJS y renderizará el Presentation Model. No contiene backend core.
          </p>
        </div>
      </section>
      <aside className="border-l border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Properties</p>
        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p>Layout: title</p>
          <p>Mode: default</p>
          <p>Visibility: resolved by backend/domain contracts</p>
        </div>
      </aside>
    </main>
  );
}
