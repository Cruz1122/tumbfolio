export function PresentationPlaceholder() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-10 text-gray-900">
      <section className="aspect-video w-full max-w-6xl rounded-2xl border border-gray-200 bg-[#FFFBF7] p-12 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Present mode</p>
        <h1 className="mt-8 text-5xl font-bold">HTML es el formato canónico</h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          Esta ruta será read-only y cargará el deck desde la API NestJS. PDF y PPTX serán derivados.
        </p>
      </section>
    </main>
  );
}
