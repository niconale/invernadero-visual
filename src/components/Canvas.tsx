import { forwardRef, useMemo } from "react";
import { FORMATS } from "@/families/types";
import type { FamilyDefinition, TemplateDefinition, LayoutPreset, FieldValues, FormatId } from "@/families/types";
import type { ImageState } from "@/store/editor";

interface CanvasProps {
  family: FamilyDefinition;
  template: TemplateDefinition;
  preset: LayoutPreset;
  format: FormatId;
  values: FieldValues;
  image: ImageState;
  textColor: "crema" | "blanco" | "negro";
  scale: number; // visual scale for preview
}

const CREMA = "#F3EDE0";
const VERDE = "#1C2E1E";

function pickColor(c: "crema" | "blanco" | "negro") {
  if (c === "crema") return CREMA;
  if (c === "blanco") return "#FFFFFF";
  return "#111111";
}

function fieldOrder(t: TemplateDefinition, v: FieldValues): { id: string; value: string }[] {
  return t.fields.map((f) => ({ id: f.id, value: (v[f.id] || "").trim() })).filter((x) => x.value);
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { family, template, preset, format, values, image, textColor, scale },
  ref,
) {
  const dims = FORMATS[format];
  const txtColor = pickColor(textColor);
  const useSolid = preset.variant === "color";
  const useColorFoto = preset.variant === "color-foto";
  const bgColor = family.color;
  const items = useMemo(() => fieldOrder(template, values), [template, values]);

  const titulo = values.titulo || "Título";
  const rest = items.filter((i) => i.id !== "titulo");

  // block position styles
  const blockPos: React.CSSProperties = (() => {
    const PAD = 80;
    switch (preset.block) {
      case "abajo-izq":
        return { left: PAD, right: PAD, bottom: PAD, textAlign: "left" };
      case "abajo-centro":
        return { left: PAD, right: PAD, bottom: PAD, textAlign: "center" };
      case "abajo-der":
        return { left: PAD, right: PAD, bottom: PAD, textAlign: "right" };
      case "arriba-izq":
        return { left: PAD, right: PAD, top: PAD, textAlign: "left" };
      case "centro":
        return { left: PAD, right: PAD, top: "50%", transform: "translateY(-50%)", textAlign: "center" };
    }
  })();

  // image transform
  const imgTransform = `translate(${image.x}%, ${image.y}%) scale(${image.zoom})`;
  const brightnessFilter = `brightness(${0.5 + image.brightness / 100})`;

  return (
    <div
      style={{
        width: dims.w * scale,
        height: dims.h * scale,
        position: "relative",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <div
        ref={ref}
        style={{
          width: dims.w,
          height: dims.h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          overflow: "hidden",
          background: useSolid ? bgColor : "#1a1a1a",
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        {/* background photo */}
        {!useSolid && image.url && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img
              src={image.url}
              alt=""
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: imgTransform,
                filter: brightnessFilter,
              }}
            />
            {/* gradient overlay to anchor text */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(${preset.block.startsWith("arriba") ? "180deg" : "0deg"}, rgba(0,0,0,${image.overlay / 100}) 0%, rgba(0,0,0,0) 55%)`,
              }}
            />
          </div>
        )}

        {/* color-foto: solid panel + small photo */}
        {useColorFoto && image.url && (
          <div
            style={{
              position: "absolute",
              top: 80,
              right: 80,
              width: dims.w * 0.45,
              height: dims.w * 0.45,
              overflow: "hidden",
              border: `4px solid ${CREMA}`,
            }}
          >
            <img
              src={image.url}
              alt=""
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: imgTransform, filter: brightnessFilter }}
            />
          </div>
        )}
        {useColorFoto && (
          <div style={{ position: "absolute", inset: 0, background: bgColor, zIndex: -1 }} />
        )}

        {/* family color band when foto + accent barra-lateral */}
        {preset.accent === "barra-lateral" && !useSolid && (
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: bgColor }} />
        )}
        {preset.accent === "marco" && (
          <div style={{ position: "absolute", inset: 32, border: `3px solid ${CREMA}`, pointerEvents: "none" }} />
        )}

        {/* family chip top-left */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            padding: "10px 22px",
            background: bgColor,
            color: family.textOnColor,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {family.label}
        </div>

        {/* main text block */}
        <div style={{ position: "absolute", color: txtColor, ...blockPos }}>
          <h1
            style={{
              fontSize: titulo.length > 28 ? 88 : titulo.length > 18 ? 110 : 132,
              lineHeight: 0.95,
              fontWeight: 800,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
            }}
          >
            {titulo}
          </h1>
          {rest.length > 0 && (
            <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
              {rest.map((r) => {
                const field = template.fields.find((f) => f.id === r.id);
                const big = ["fecha", "hora"].includes(r.id);
                return (
                  <div
                    key={r.id}
                    style={{
                      fontSize: big ? 44 : 32,
                      fontWeight: big ? 700 : 500,
                      lineHeight: 1.25,
                      opacity: r.id === "cta" ? 1 : 0.95,
                    }}
                  >
                    {r.id === "cta" ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "12px 22px",
                          background: txtColor,
                          color: useSolid ? bgColor : VERDE,
                          fontWeight: 700,
                          fontSize: 28,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {r.value}
                      </span>
                    ) : (
                      <>
                        {field?.label && r.id !== "titulo" && r.id !== "descripcion" && r.id !== "nota" ? null : null}
                        {r.value}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* footer brand */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 60,
            color: txtColor,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          El Invernadero Circo
        </div>
      </div>
    </div>
  );
});
