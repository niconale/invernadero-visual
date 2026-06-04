import { forwardRef } from "react";
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
  scale: number;
}

const BEBAS = '"Bebas Neue", "DM Sans", sans-serif';
const DM = '"DM Sans", sans-serif';
const CREMA = "#F3EDE0";

/** Normalize overlay slider (0..80) to a multiplier centered around 1. */
function overlayK(overlay: number): number {
  return Math.max(0.6, Math.min(1.4, overlay / 50));
}

/** Wrap a string in « » only if it doesn't already start with a quote char. */
function quoted(s: string): string {
  const t = s.trim();
  if (!t) return "";
  if (/^[«"“'`]/.test(t)) return t;
  return `«${t}»`;
}

function ImageBg({ image }: { image: ImageState }) {
  if (!image.url) {
    return <div style={{ position: "absolute", inset: 0, background: "#1a1a1a" }} />;
  }
  // Brightness centered at 50 → 1.0 (no filter clipping when user doesn't touch it)
  const b = 0.5 + image.brightness / 100; // 0.5..1.5
  return (
    <img
      src={image.url}
      alt=""
      crossOrigin="anonymous"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `translate(${image.x}%, ${image.y}%) scale(${image.zoom})`,
        filter: `brightness(${b})`,
      }}
    />
  );
}

/* ───────────────────────── PROGRAMACIÓN ───────────────────────── */

function ProgramacionRender({
  family, preset, format, values, image,
}: {
  family: FamilyDefinition; preset: LayoutPreset; format: FormatId; values: FieldValues; image: ImageState;
}) {
  const dims = FORMATS[format];
  const dia = (values.dia || "").trim();
  const mes = (values.mes || "").trim().toUpperCase();
  const titulo = (values.titulo || "").trim().toUpperCase();
  const hora = (values.hora || "").trim().toUpperCase();
  const publico = (values.publico || "").trim().toUpperCase();
  const cta = (values.cta || "").trim().toUpperCase();

  const RED = family.color;
  const k = overlayK(image.overlay);

  const ctaAlign = preset.tokens.ctaAlign ?? "center";
  const titleScale = preset.tokens.titleScale ?? 1;

  // Layout numbers (1080x1350 reference)
  const PAD = 70;
  const DATE_SIZE = 168;

  // Title sizing: fit within left padding and the date-box column.
  const baseTitle = 118 * titleScale;
  const titleSize = baseTitle;

  return (
    <>
      <ImageBg image={image} />

      {/* ───── Graduated mask stack ───── */}
      {/* Top fade: gives the orange title contrast */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(0,0,0,${0.55 * k}) 0%,
            rgba(0,0,0,${0.35 * k}) 12%,
            rgba(0,0,0,${0.12 * k}) 24%,
            rgba(0,0,0,0) 38%)`,
          mixBlendMode: "multiply",
        }}
      />
      {/* Bottom long fade: legibility for white title + CTA */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(0,0,0,0) 40%,
            rgba(0,0,0,${0.18 * k}) 58%,
            rgba(0,0,0,${0.55 * k}) 80%,
            rgba(0,0,0,${0.92 * k}) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      {/* Radial behind date box, helps red-on-red */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at calc(100% - ${PAD + DATE_SIZE / 2}px) ${PAD + DATE_SIZE / 2}px,
            rgba(0,0,0,${0.45 * k}) 0%,
            rgba(0,0,0,${0.22 * k}) 25%,
            rgba(0,0,0,0) 55%)`,
          mixBlendMode: "multiply",
        }}
      />

      {/* Big PROGRAMACIÓN title (top, left, orange) */}
      <div
        style={{
          position: "absolute",
          top: PAD - 12,
          left: PAD,
          right: PAD + DATE_SIZE + 30,
          fontFamily: BEBAS,
          color: RED,
          fontSize: titleSize,
          lineHeight: 0.88,
          letterSpacing: "0em",
          textTransform: "uppercase",
          textShadow: "0 2px 18px rgba(0,0,0,0.35)",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {family.label}
      </div>

      {/* Date box (top-right, red) */}
      {(dia || mes) && (
        <div
          style={{
            position: "absolute",
            top: PAD,
            right: PAD,
            width: DATE_SIZE,
            height: DATE_SIZE,
            background: RED,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: BEBAS,
            lineHeight: 0.82,
            paddingTop: 10,
            boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ fontSize: DATE_SIZE * 0.62, letterSpacing: "-0.02em" }}>{dia || "—"}</span>
          <span style={{ fontSize: DATE_SIZE * 0.17, letterSpacing: "0.1em", marginTop: 12 }}>{mes}</span>
        </div>
      )}

      {/* Bottom block */}
      <div
        style={{
          position: "absolute",
          left: PAD,
          right: PAD,
          bottom: 90,
          display: "flex",
          flexDirection: "column",
          alignItems: ctaAlign === "center" ? "center" : "flex-start",
          gap: 24,
          color: CREMA,
          textAlign: ctaAlign,
        }}
      >
        {titulo && (
          <div
            style={{
              fontFamily: BEBAS,
              fontSize: titulo.length > 26 ? 64 : 78,
              lineHeight: 0.95,
              letterSpacing: "0.01em",
              color: "#fff",
              maxWidth: "100%",
              wordBreak: "break-word",
              textShadow: "0 2px 16px rgba(0,0,0,0.4)",
            }}
          >
            {quoted(titulo)}
          </div>
        )}
        {(hora || publico) && (
          <div
            style={{
              fontFamily: BEBAS,
              fontSize: 38,
              lineHeight: 1,
              letterSpacing: "0.08em",
              color: "#fff",
              opacity: 0.95,
            }}
          >
            {[hora, publico].filter(Boolean).join("   ·   ")}
          </div>
        )}
        {cta && (
          <div
            style={{
              marginTop: 6,
              background: RED,
              color: "#fff",
              fontFamily: BEBAS,
              fontSize: 38,
              letterSpacing: "0.1em",
              padding: "20px 42px",
              textAlign: "center",
              lineHeight: 1,
              boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
            }}
          >
            {cta}
          </div>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── RESIDENCIAS ───────────────────────── */

function ResidenciasRender({
  family, preset, format, values, image,
}: {
  family: FamilyDefinition; preset: LayoutPreset; format: FormatId; values: FieldValues; image: ImageState;
}) {
  const dims = FORMATS[format];
  const artista = (values.artista || "").trim().toUpperCase();
  const titulo = (values.titulo || "").trim().toUpperCase();
  const programa = (values.programa || "").trim().toUpperCase();

  const PLUM = family.color;
  const k = overlayK(image.overlay);

  const verticalSide = preset.tokens.verticalSide ?? "right";
  const verticalOpacity = preset.tokens.verticalOpacity ?? 0.95;
  const blockBottom = preset.tokens.blockBottom ?? 110;

  const PAD = 70;
  const VERTICAL_FONT = 200;

  // Vertical text via rotate (more reliable than writing-mode for html-to-image).
  // For right side: rotate -90deg, anchored to right edge.
  // For left side: rotate 90deg, anchored to left edge.
  const verticalStyle: React.CSSProperties = verticalSide === "right"
    ? {
        position: "absolute",
        top: PAD,
        right: PAD - 18,
        transform: "rotate(-90deg)",
        transformOrigin: "top right",
        // After rotation: width becomes the canvas vertical run; height = font size box
        width: dims.h - PAD * 2,
        fontFamily: BEBAS,
        color: PLUM,
        fontSize: VERTICAL_FONT,
        lineHeight: 1,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        opacity: verticalOpacity,
        textAlign: "left",
        whiteSpace: "nowrap",
        textShadow: "0 2px 18px rgba(0,0,0,0.35)",
      }
    : {
        position: "absolute",
        bottom: PAD,
        left: PAD + VERTICAL_FONT,
        transform: "rotate(-90deg)",
        transformOrigin: "bottom left",
        width: dims.h - PAD * 2,
        fontFamily: BEBAS,
        color: PLUM,
        fontSize: VERTICAL_FONT,
        lineHeight: 1,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        opacity: verticalOpacity,
        textAlign: "left",
        whiteSpace: "nowrap",
        textShadow: "0 2px 18px rgba(0,0,0,0.35)",
      };

  return (
    <>
      <ImageBg image={image} />

      {/* ───── Graduated mask stack ───── */}
      {/* Bottom long fade for the text block */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(0,0,0,0) 35%,
            rgba(0,0,0,${0.2 * k}) 55%,
            rgba(0,0,0,${0.55 * k}) 78%,
            rgba(0,0,0,${0.88 * k}) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      {/* Side fade (where vertical RESIDENCIAS sits) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${verticalSide === "right" ? "270deg" : "90deg"},
            rgba(0,0,0,0) 55%,
            rgba(0,0,0,${0.25 * k}) 82%,
            rgba(0,0,0,${0.55 * k}) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      {/* Soft corner radial reinforces the block area (bottom-left) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at ${verticalSide === "right" ? "20%" : "80%"} 95%,
            rgba(0,0,0,${0.55 * k}) 0%,
            rgba(0,0,0,${0.25 * k}) 35%,
            rgba(0,0,0,0) 65%)`,
          mixBlendMode: "multiply",
        }}
      />

      {/* Vertical RESIDENCIAS */}
      <div style={verticalStyle}>{family.label}</div>

      {/* Bottom text block */}
      <div
        style={{
          position: "absolute",
          left: verticalSide === "left" ? PAD + VERTICAL_FONT + 30 : PAD,
          right: verticalSide === "right" ? PAD + VERTICAL_FONT - 20 : PAD,
          bottom: blockBottom,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {artista && (
          <div
            style={{
              fontFamily: BEBAS,
              color: PLUM,
              fontSize: artista.length > 22 ? 78 : 92,
              lineHeight: 0.9,
              letterSpacing: "0.01em",
              textShadow: "0 2px 14px rgba(0,0,0,0.35)",
            }}
          >
            {artista}
          </div>
        )}
        {titulo && (
          <div
            style={{
              fontFamily: BEBAS,
              color: "#fff",
              fontSize: titulo.length > 24 ? 56 : 68,
              lineHeight: 0.95,
              letterSpacing: "0.01em",
              textShadow: "0 2px 14px rgba(0,0,0,0.4)",
            }}
          >
            {quoted(titulo)}
          </div>
        )}
        {programa && (
          <div
            style={{
              fontFamily: DM,
              color: "#fff",
              fontSize: 22,
              letterSpacing: "0.18em",
              lineHeight: 1.35,
              fontWeight: 500,
              marginTop: 8,
              opacity: 0.92,
            }}
          >
            {programa}
          </div>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── Canvas wrapper ───────────────────────── */

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { family, preset, format, values, image, scale },
  ref,
) {
  const dims = FORMATS[format];
  return (
    <div
      style={{
        width: dims.w * scale,
        height: dims.h * scale,
        position: "relative",
        overflow: "hidden",
        background: "#0a0a0a",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
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
          background: "#0a0a0a",
        }}
      >
        {family.id === "programacion" && (
          <ProgramacionRender family={family} preset={preset} format={format} values={values} image={image} />
        )}
        {family.id === "residencias" && (
          <ResidenciasRender family={family} preset={preset} format={format} values={values} image={image} />
        )}
      </div>
    </div>
  );
});
