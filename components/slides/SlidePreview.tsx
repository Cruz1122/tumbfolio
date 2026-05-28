type SlidePreviewProps = {
  title: string;
  subtitle: string;
};

export function SlidePreview({ title, subtitle }: Readonly<SlidePreviewProps>) {
  return (
    <article className="rounded-2xl border border-orange-200 bg-white p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">Tumbfolio</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{subtitle}</p>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[".ipynb ejecutado", "Presentation Model", "HTML canónico"].map((step) => (
          <div key={step} className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700">
            {step}
          </div>
        ))}
      </div>
    </article>
  );
}
