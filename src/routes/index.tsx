import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FAMILIES } from "@/families";
import { FORMATS } from "@/families/types";
import { useEditor, useCurrentTemplate, posKey } from "@/store/editor";
import { Canvas } from "@/components/Canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportNode, slugify } from "@/lib/export";
import { generateCopy } from "@/lib/copy.functions";
import { toast, Toaster } from "sonner";
import { Loader2, Download, Sparkles, Upload, Trash2, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Generador · El Invernadero" },
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
  const [copy, setCopy] = useState<null | { principal: string; corta: string; cta: string; hashtags: string[]; stories: string[] }>(null);
  const callGenerateCopy = useServerFn(generateCopy);

  const dims = FORMATS[s.format];
  const preset = tpl.presets.find((p) => p.id === s.preset) ?? tpl.presets[0];

  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current; if (!el) return;
      const padding = 48;
      const sc = Math.min((el.clientWidth - padding) / dims.w, (el.clientHeight - padding) / dims.h, 0.7);
      setScale(Math.max(0.15, sc));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [dims.w, dims.h]);

  const onFile = (file: File) => {
    if (s.image.url) URL.revokeObjectURL(s.image.url);
    s.setImage({ url: URL.createObjectURL(file), zoom: 1, x: 0, y: 0 });
  };

  const handleExport = async (format: "png" | "jpg") => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const name = `${slugify(fam.label)}_${slugify(tpl.label)}_${slugify(s.values.titulo || "pieza")}_${s.format.replace(":", "x")}`;
      await exportNode(canvasRef.current, format, dims.w, dims.h, name);
      toast.success(`Exportado ${format.toUpperCase()}`);
    } catch (e) { console.error(e); toast.error("No pude exportar."); }
    finally { setBusy(false); }
  };

  const handleCopy = async () => {
    setBusy(true);
    try {
      const r = await callGenerateCopy({
        data: { familia: s.familyId, plantilla: s.templateId, valores: s.values, referencias: s.referenceCaptions, contexto: s.contexto },
      });
      setCopy(r.result);
      toast.success(r.source === "ai" ? "Copy generado con IA" : "Copy local");
    } catch (e) { console.error(e); toast.error("No pude generar copy"); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-marca-crema)" }}>
      <Toaster richColors position="top-center" />
      <aside className="w-[380px] shrink-0 border-r overflow-y-auto" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#FBF7EE" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--color-marca-verde)" }}>
            Generador · El Invernadero
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Arrastrá los textos sobre el canvas</p>
        </div>

        <Section title="Familia">
          <div className="grid grid-cols-2 gap-2">
            {FAMILIES.map((f) => (
              <button
                key={f.id} onClick={() => s.setFamily(f.id)}
                className="rounded-md px-3 py-2 text-sm font-medium border"
                style={{
                  background: s.familyId === f.id ? f.color : "transparent",
                  color: s.familyId === f.id ? f.textOnColor : "var(--color-marca-verde)",
                  borderColor: s.familyId === f.id ? f.color : "rgba(0,0,0,0.12)",
                }}
              >{f.label}</button>
            ))}
          </div>
        </Section>

        <Section title="Plantilla">
          <Select value={s.templateId} onValueChange={s.setTemplate}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {fam.templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">{tpl.description}</p>
        </Section>

        <Section title="Formato">
          <div className="flex gap-2">
            {(Object.keys(FORMATS) as Array<keyof typeof FORMATS>).map((f) => (
              <button
                key={f} onClick={() => s.setFormat(f)}
                className="flex-1 rounded-md px-3 py-2 text-xs font-medium border"
                style={{
                  background: s.format === f ? "var(--color-marca-verde)" : "transparent",
                  color: s.format === f ? "var(--color-marca-crema)" : "var(--color-marca-verde)",
                  borderColor: s.format === f ? "var(--color-marca-verde)" : "rgba(0,0,0,0.12)",
                }}
              >{FORMATS[f].label}</button>
            ))}
          </div>
        </Section>

        <Section title="Contenido">
          <div className="space-y-3">
            {tpl.fields.map((field) => (
              <div key={field.id}>
                <Label className="text-xs">
                  {field.label}{field.required && <span style={{ color: fam.color }}> *</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={s.values[field.id] || ""}
                    onChange={(e) => s.setValue(field.id, e.target.value)}
                    placeholder={field.placeholder} maxLength={field.maxLength} rows={3} className="mt-1"
                  />
                ) : (
                  <Input
                    value={s.values[field.id] || ""}
                    onChange={(e) => s.setValue(field.id, e.target.value)}
                    placeholder={field.placeholder} maxLength={field.maxLength} className="mt-1"
                  />
                )}
                {field.options && field.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {field.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => s.setValue(field.id, opt)}
                        className="text-[10px] px-2 py-0.5 rounded border"
                        style={{
                          borderColor: "rgba(0,0,0,0.15)",
                          background: s.values[field.id] === opt ? fam.color : "transparent",
                          color: s.values[field.id] === opt ? fam.textOnColor : "inherit",
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div>
              <Label className="text-xs">Comillas simples 'título'</Label>
              <p className="text-[10px] text-muted-foreground">Activa el wrap 'así' en lugar de "así".</p>
            </div>
            <Switch checked={s.useSingleQuotes} onCheckedChange={s.toggleQuotes} />
          </div>
          {s.familyId === "programacion" && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div>
                <Label className="text-xs">Unir hora + público</Label>
                <p className="text-[10px] text-muted-foreground">Render: 21:00 H · PÚBLICO FAMILIAR</p>
              </div>
              <Switch checked={s.mergeHoraPublico} onCheckedChange={s.setMergeHoraPublico} />
            </div>
          )}
        </Section>

        <Section title="Bloques">
          <div className="space-y-3">
            {tpl.blocks.map((b) => {
              const key = `${s.familyId}.${s.templateId}.${b.id}`;
              const hidden = !!s.hiddenBlocks[key];
              const size = s.blockSizes[key] ?? 1;
              const mergedHidden = s.familyId === "programacion" && s.mergeHoraPublico && b.id === "publico";
              return (
                <div key={b.id} className="rounded border p-2" style={{ borderColor: "rgba(0,0,0,0.08)", opacity: mergedHidden ? 0.5 : 1 }}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{b.label}</Label>
                    <Switch
                      checked={!hidden && !mergedHidden}
                      disabled={mergedHidden}
                      onCheckedChange={(v) => s.setBlockHidden(b.id, !v)}
                    />
                  </div>
                  {!hidden && !mergedHidden && (
                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Tamaño</span><span>{Math.round(size * 100)}%</span>
                        </div>
                        <Slider value={[size]} min={0.5} max={1.8} step={0.05}
                          onValueChange={(v) => s.setBlockSize(b.id, v[0])} />
                      </div>
                      {b.wrapControl && (() => {
                        const nw = s.blockNoWrap[key];
                        const effective = nw !== undefined ? nw : !!b.defaultNoWrap;
                        return (
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Salto de línea</Label>
                            <div className="flex gap-1 mt-1">
                              <button type="button" onClick={() => s.setBlockNoWrap(b.id, true)}
                                className="flex-1 text-[10px] px-2 py-1 rounded border"
                                style={{
                                  background: effective ? fam.color : "transparent",
                                  color: effective ? fam.textOnColor : "inherit",
                                  borderColor: effective ? fam.color : "rgba(0,0,0,0.15)",
                                }}>Una línea</button>
                              <button type="button" onClick={() => s.setBlockNoWrap(b.id, false)}
                                className="flex-1 text-[10px] px-2 py-1 rounded border"
                                style={{
                                  background: !effective ? fam.color : "transparent",
                                  color: !effective ? fam.textOnColor : "inherit",
                                  borderColor: !effective ? fam.color : "rgba(0,0,0,0.15)",
                                }}>Multilínea</button>
                            </div>
                          </div>
                        );
                      })()}
                      {b.kind === "logo" && (() => {
                        const pk = posKey(s.familyId, s.templateId, b.id, s.format);
                        const cur = s.blockPositions[pk] ?? { x: b.x, y: b.y };
                        return (
                          <>
                            <div>
                              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Posición X</span><span>{Math.round(cur.x)}%</span>
                              </div>
                              <Slider value={[cur.x]} min={0} max={100} step={1}
                                onValueChange={(v) => s.setBlockPos(b.id, { x: v[0], y: cur.y })} />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Posición Y</span><span>{Math.round(cur.y)}%</span>
                              </div>
                              <Slider value={[cur.y]} min={0} max={100} step={1}
                                onValueChange={(v) => s.setBlockPos(b.id, { x: cur.x, y: v[0] })} />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>


        <Section title="Imagen">
          <input type="file" accept="image/*" id="img-upload" className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => document.getElementById("img-upload")?.click()}>
              <Upload className="w-3 h-3 mr-1" /> Subir
            </Button>
            {s.image.url && (
              <Button variant="ghost" size="sm" onClick={s.clearImage}><Trash2 className="w-3 h-3" /></Button>
            )}
          </div>
          {s.image.url && (
            <div className="space-y-3 mt-3">
              <SliderRow label="Zoom" value={s.image.zoom} min={1} max={3} step={0.05} onChange={(v) => s.setImage({ zoom: v })} />
              <SliderRow label="Posición X" value={s.image.x} min={-40} max={40} step={1} onChange={(v) => s.setImage({ x: v })} />
              <SliderRow label="Posición Y" value={s.image.y} min={-40} max={40} step={1} onChange={(v) => s.setImage({ y: v })} />
              <SliderRow label="Brillo" value={s.image.brightness} min={0} max={100} step={1} onChange={(v) => s.setImage({ brightness: v })} />
              <SliderRow label="Overlay base" value={s.image.overlay} min={0} max={80} step={1} onChange={(v) => s.setImage({ overlay: v })} />
            </div>
          )}
        </Section>

        <Section title="Máscaras graduadas">
          <div className="space-y-3">
            <SliderRow label="Máscara superior" value={s.mask.top} min={0} max={130} step={1} onChange={(v) => s.setMask({ top: v })} />
            <SliderRow label="Máscara inferior" value={s.mask.bottom} min={0} max={100} step={1} onChange={(v) => s.setMask({ bottom: v })} />
            <SliderRow label="Máscara izquierda" value={s.mask.left} min={0} max={100} step={1} onChange={(v) => s.setMask({ left: v })} />
            <SliderRow label="Máscara derecha" value={s.mask.right} min={0} max={100} step={1} onChange={(v) => s.setMask({ right: v })} />
            <SliderRow label="Alcance / tamaño" value={s.mask.size} min={0} max={100} step={1} onChange={(v) => s.setMask({ size: v })} />
            <SliderRow label="Suavidad (feather)" value={s.mask.feather} min={0} max={100} step={1} onChange={(v) => s.setMask({ feather: v })} />
            <SliderRow label="Viñeteado" value={s.mask.vignette} min={0} max={100} step={1} onChange={(v) => s.setMask({ vignette: v })} />
          </div>
        </Section>

        <Section title="Disposición">
          <div className="grid grid-cols-3 gap-2">
            {tpl.presets.map((p) => (
              <button key={p.id} onClick={() => s.setPreset(p.id)}
                className="rounded-md px-2 py-3 text-xs border font-medium"
                style={{
                  background: s.preset === p.id ? fam.color : "transparent",
                  color: s.preset === p.id ? fam.textOnColor : "var(--color-marca-verde)",
                  borderColor: s.preset === p.id ? fam.color : "rgba(0,0,0,0.12)",
                }}
                title={p.label}
              >{p.id}</button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{preset.label}</p>

          <div className="flex items-center justify-between mt-3">
            <Label className="text-xs">Snapping a grilla</Label>
            <Switch checked={s.snapping} onCheckedChange={s.setSnapping} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <Label className="text-xs">Mostrar zona segura</Label>
            <Switch checked={s.showSafeZone} onCheckedChange={s.setShowSafeZone} />
          </div>

          {(s.familyId === "escuela" || s.familyId === "residencias") && (
            <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <Label className="text-xs font-medium">Guías ({s.format})</Label>
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground">Guía vertical</Label>
                <Switch
                  checked={s.guides[s.format].showX}
                  onCheckedChange={(v) => s.setGuide(s.format, { showX: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground">Guía horizontal</Label>
                <Switch
                  checked={s.guides[s.format].showY}
                  onCheckedChange={(v) => s.setGuide(s.format, { showY: v })}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Arrastralas sobre el canvas. Desactivalas antes de exportar.</p>
            </div>
          )}

          <Button variant="ghost" size="sm" className="w-full mt-3" onClick={s.resetBlocks}>
            <RotateCcw className="w-3 h-3 mr-1" /> Restablecer posiciones
          </Button>
        </Section>

        <Section title="Copy con tono Invernadero">
          <Label className="text-xs">Contexto complementario para copy (opcional)</Label>
          <Textarea
            value={s.contexto}
            onChange={(e) => s.setContexto(e.target.value)}
            placeholder="Pegá sinopsis oficial, descripción de la compañía, notas internas, qué destacar, qué evitar, tono deseado, links de reserva, nivel o requisitos. Se usa como apoyo; los campos de la plantilla mandan."
            rows={5} className="mt-1 text-xs"
          />
          <Label className="text-xs mt-3 block">Captions de referencia (opcional)</Label>
          <Textarea
            value={s.referenceCaptions}
            onChange={(e) => s.setReferenceCaptions(e.target.value)}
            placeholder="Pegá aquí 3–10 captions reales de @elinvernadero para entrenar el tono."
            rows={4} className="mt-1 text-xs"
          />
          <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleCopy} disabled={busy}>
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Generar copy
          </Button>
          {copy && (
            <div className="space-y-2 mt-3">
              {([
                { label: "Copy principal", value: copy.principal },
                { label: "Versión corta", value: copy.corta },
                { label: "CTA", value: copy.cta },
                { label: "Hashtags", value: copy.hashtags.join(" ") },
                { label: "Stories", value: copy.stories.map((st, i) => `${i + 1}. ${st}`).join("\n") },
              ]).map((block) => (
                <div key={block.label} className="text-xs p-2 rounded border bg-white" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{block.label}</div>
                  <p className="whitespace-pre-wrap">{block.value}</p>
                  <button className="text-[10px] mt-1 underline text-muted-foreground"
                    onClick={() => { navigator.clipboard.writeText(block.value); toast.success("Copiado"); }}>
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

      <main ref={wrapRef} className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-auto">
        <Canvas
          ref={canvasRef}
          family={fam}
          template={tpl}
          preset={preset}
          format={s.format}
          values={s.values}
          image={s.image}
          mask={s.mask}
          scale={scale}
          blockPositions={s.blockPositions}
          hiddenBlocks={s.hiddenBlocks}
          blockSizes={s.blockSizes}
          blockNoWrap={s.blockNoWrap}
          mergeHoraPublico={s.mergeHoraPublico}
          onBlockMove={s.setBlockPos}
          useSingleQuotes={s.useSingleQuotes}
          snapping={s.snapping}
          showSafeZone={s.showSafeZone}
          interactive={true}
        />
        <p className="text-xs text-muted-foreground mt-4">
          Preview a {Math.round(scale * 100)}% · arrastrá los bloques para reubicarlos
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
  label, value, min, max, step, onChange,
}: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
        <span>{label}</span><span>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
