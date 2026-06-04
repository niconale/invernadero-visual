import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FAMILIES } from "@/families";
import { FORMATS } from "@/families/types";
import { useEditor, useCurrentTemplate } from "@/store/editor";
import { Canvas } from "@/components/Canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportNode, slugify } from "@/lib/export";
import { generateCopy } from "@/lib/copy.functions";
import { toast, Toaster } from "sonner";
import { Loader2, Download, Sparkles, Upload, Trash2, Shuffle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Generador de Plantillas · El Invernadero" },
      { name: "description", content: "Generador de piezas de Instagram para El Invernadero Circo." },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  const s = useEditor();
  const tpl = useCurrentTemplate();
  const fam = FAMILIES.find((f) => f.id === s.familyId)!;
  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [busy, setBusy] = useState(false);
  const [copies, setCopies] = useState<string[]>([]);
  const callGenerateCopy = useServerFn(generateCopy);

  const dims = FORMATS[s.format];
  const preset = tpl.presets.find((p) => p.id === s.preset) ?? tpl.presets[0];

  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      const padding = 48;
      const availW = el.clientWidth - padding;
      const availH = el.clientHeight - padding;
      const sc = Math.min(availW / dims.w, availH / dims.h, 0.7);
      setScale(Math.max(0.15, sc));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [dims.w, dims.h]);

  const onFile = (file: File) => {
    if (s.image.url) URL.revokeObjectURL(s.image.url);
    const url = URL.createObjectURL(file);
    s.setImage({ url, zoom: 1, x: 0, y: 0 });
  };

  const handleExport = async (format: "png" | "jpg") => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const name = `${slugify(fam.label)}_${slugify(tpl.label)}_${slugify(s.values.titulo || "pieza")}_${s.format.replace(":", "x")}`;
      await exportNode(canvasRef.current, format, dims.w, dims.h, name);
      toast.success(`Exportado ${format.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      toast.error("No pude exportar. Revisá la consola.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    setBusy(true);
    try {
      const r = await callGenerateCopy({ data: { familia: s.familyId, plantilla: s.templateId, valores: s.values } });
      setCopies(r.copies);
      toast.success(r.source === "ai" ? "Copy generado con IA" : "Copy local");
    } catch (e) {
      console.error(e);
      toast.error("No pude generar copy");
    } finally {
      setBusy(false);
    }
  };

  const validations: string[] = [];
  if ((s.values.titulo || "").length > 36) validations.push("El título es largo, puede romper la jerarquía.");
  if (s.familyId === "programacion" && !s.values.cta) validations.push("Programación necesita un CTA.");
  if (s.textColor !== "negro" && s.image.url && s.image.overlay < 30 && preset.variant !== "color")
    validations.push("Overlay bajo: el texto puede no leerse sobre la foto.");
  if (s.textColor !== "negro" && s.image.brightness > 75 && preset.variant !== "color")
    validations.push("La foto está muy clara para texto claro. Subí overlay o cambiá a texto oscuro.");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-marca-crema)" }}>
      <Toaster richColors position="top-center" />
      {/* Left panel */}
      <aside className="w-[380px] shrink-0 border-r overflow-y-auto" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#FBF7EE" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--color-marca-verde)" }}>
            Generador · El Invernadero
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">MVP — Programación y Residencias</p>
        </div>

        <Section title="Familia">
          <div className="grid grid-cols-2 gap-2">
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                onClick={() => s.setFamily(f.id)}
                className="rounded-md px-3 py-2 text-sm font-medium transition-all border"
                style={{
                  background: s.familyId === f.id ? f.color : "transparent",
                  color: s.familyId === f.id ? f.textOnColor : "var(--color-marca-verde)",
                  borderColor: s.familyId === f.id ? f.color : "rgba(0,0,0,0.12)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Plantilla">
          <Select value={s.templateId} onValueChange={s.setTemplate}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {fam.templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">{tpl.description}</p>
        </Section>

        <Section title="Formato">
          <div className="flex gap-2">
            {(Object.keys(FORMATS) as Array<keyof typeof FORMATS>).map((f) => (
              <button
                key={f}
                onClick={() => s.setFormat(f)}
                className="flex-1 rounded-md px-3 py-2 text-xs font-medium border"
                style={{
                  background: s.format === f ? "var(--color-marca-verde)" : "transparent",
                  color: s.format === f ? "var(--color-marca-crema)" : "var(--color-marca-verde)",
                  borderColor: s.format === f ? "var(--color-marca-verde)" : "rgba(0,0,0,0.12)",
                }}
              >
                {FORMATS[f].label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Contenido">
          <div className="space-y-3">
            {tpl.fields.map((field) => (
              <div key={field.id}>
                <Label className="text-xs">
                  {field.label}
                  {field.required && <span style={{ color: "var(--color-marca-programacion)" }}> *</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={s.values[field.id] || ""}
                    onChange={(e) => s.setValue(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    rows={3}
                    className="mt-1"
                  />
                ) : (
                  <Input
                    value={s.values[field.id] || ""}
                    onChange={(e) => s.setValue(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    className="mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Texto">
          <Label className="text-xs">Color del texto</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {(["crema", "blanco", "negro"] as const).map((c) => (
              <button
                key={c}
                onClick={() => s.setTextColor(c)}
                className="rounded-md px-2 py-1.5 text-xs border capitalize"
                style={{
                  background: s.textColor === c ? "var(--color-marca-verde)" : "transparent",
                  color: s.textColor === c ? "var(--color-marca-crema)" : "var(--color-marca-verde)",
                  borderColor: "rgba(0,0,0,0.12)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Imagen">
          <input
            type="file"
            accept="image/*"
            id="img-upload"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => document.getElementById("img-upload")?.click()}>
              <Upload className="w-3 h-3 mr-1" /> Subir
            </Button>
            {s.image.url && (
              <Button variant="ghost" size="sm" onClick={s.clearImage}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          {s.image.url && (
            <div className="space-y-3 mt-3">
              <SliderRow label="Zoom" value={s.image.zoom} min={1} max={3} step={0.05} onChange={(v) => s.setImage({ zoom: v })} />
              <SliderRow label="Posición X" value={s.image.x} min={-40} max={40} step={1} onChange={(v) => s.setImage({ x: v })} />
              <SliderRow label="Posición Y" value={s.image.y} min={-40} max={40} step={1} onChange={(v) => s.setImage({ y: v })} />
              <SliderRow label="Brillo" value={s.image.brightness} min={0} max={100} step={1} onChange={(v) => s.setImage({ brightness: v })} />
              <SliderRow label="Overlay" value={s.image.overlay} min={0} max={80} step={1} onChange={(v) => s.setImage({ overlay: v })} />
            </div>
          )}
        </Section>

        <Section title="Composición">
          <div className="grid grid-cols-3 gap-2">
            {tpl.presets.map((p) => (
              <button
                key={p.id}
                onClick={() => s.setPreset(p.id)}
                className="rounded-md px-2 py-3 text-xs border font-medium"
                style={{
                  background: s.preset === p.id ? fam.color : "transparent",
                  color: s.preset === p.id ? fam.textOnColor : "var(--color-marca-verde)",
                  borderColor: s.preset === p.id ? fam.color : "rgba(0,0,0,0.12)",
                }}
                title={p.label}
              >
                {p.id}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{preset.label}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              const ids = tpl.presets.map((p) => p.id);
              const next = ids[(ids.indexOf(s.preset) + 1) % ids.length];
              s.setPreset(next);
            }}
          >
            <Shuffle className="w-3 h-3 mr-1" /> Proponer otra disposición
          </Button>
        </Section>

        <Section title="Copy para el post">
          <Button variant="outline" size="sm" className="w-full" onClick={handleCopy} disabled={busy}>
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Generar copy
          </Button>
          {copies.length > 0 && (
            <div className="space-y-2 mt-3">
              {copies.map((c, i) => (
                <div key={i} className="text-xs p-2 rounded border bg-white" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
                  <p>{c}</p>
                  <button
                    className="text-[10px] mt-1 underline text-muted-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(c);
                      toast.success("Copiado");
                    }}
                  >
                    copiar
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Exportar">
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => handleExport("png")} disabled={busy}>
              <Download className="w-3 h-3 mr-1" /> PNG
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleExport("jpg")} disabled={busy}>
              <Download className="w-3 h-3 mr-1" /> JPG
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{dims.w} × {dims.h} px</p>
        </Section>
      </aside>

      {/* Preview */}
      <main ref={wrapRef} className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-auto">
        {validations.length > 0 && (
          <div className="absolute top-4 left-4 right-4 flex flex-col gap-1 z-10">
            {validations.map((v, i) => (
              <div
                key={i}
                className="text-xs px-3 py-2 rounded-md border"
                style={{ background: "#FFF4E5", borderColor: "#F2C994", color: "#7A4A12" }}
              >
                ⚠ {v}
              </div>
            ))}
          </div>
        )}
        <Canvas
          ref={canvasRef}
          family={fam}
          template={tpl}
          preset={preset}
          format={s.format}
          values={s.values}
          image={s.image}
          textColor={s.textColor}
          scale={scale}
        />
        <p className="text-xs text-muted-foreground mt-4">
          Preview a {Math.round(scale * 100)}% · export a 1:1
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h2>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
