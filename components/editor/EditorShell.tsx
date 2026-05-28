import { Badge } from "@/components/ui/Badge";
import { MimeRendererPlaceholder } from "@/components/renderers/MimeRendererPlaceholder";
import { SlidePreview } from "@/components/slides/SlidePreview";

const modules = ["notebook", "presentation", "renderers", "exports", "nbxp", "storage", "ai", "security", "observability"];

export function EditorShell() {
  return (
    <main className="grid min-h-screen grid-cols-[260px_1fr_320px] bg-slate-50 text-slate-900">
      <aside className="border-r border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-orange-700">Slides</h2>
        <div className="mt-4 space-y-2">
          {["Portada", "Arquitectura", "Render", "Exports"].map((slide, index) => (
            <button key={slide} className="w-full rounded-xl border border-slate-200 p-3 text-left text-sm hover:border-orange-300">
              <span className="text-xs text-slate-500">{String(index + 1).padStart(2, "0")}</span>
              <span className="mt-1 block font-medium">{slide}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Editor base</h1>
            <p className="text-sm text-slate-600">Placeholder operativo para conectar T-09 a T-12.</p>
          </div>
          <Badge>t-01</Badge>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <SlidePreview
            title="Tumbfolio no edita el notebook"
            subtitle="El usuario editará slides y bloques derivados del Presentation Model."
          />
          <div className="mt-6">
            <MimeRendererPlaceholder mimeType="text/html" strategy="sanitize-or-sandbox" />
          </div>
        </div>
      </section>

      <aside className="border-l border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-orange-700">Módulos de dominio</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {modules.map((module) => (
            <Badge key={module} tone="neutral">{module}</Badge>
          ))}
        </div>
      </aside>
    </main>
  );
}
