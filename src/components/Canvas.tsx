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
  textColor: "crema" | "blanco" | "negro"; // unused in Programación/Residencias (fixed by design)
  useQuotes: boolean;
  scale: number;
}

const BEBAS = '"Bebas Neue", "DM Sans", sans-serif';
const DM = '"DM Sans", sans-serif';
const CREMA = "#F3EDE0";

function ImageBg({ image }: { image: ImageState }) {
  if (!image.url) {
    return <div style={{ position: "absolute", inset: 0, background: "#1a1a1a" }} />;
  }
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
        filter: `brightness(${0.5 + image.brightness / 100})`,
      }}
    />
  );
}

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

  // preset variants
  const titleSize = preset.id === "C" ? 200 : titulo.length > 22 ? 150 : 178;
  const dateBoxSize = preset.id === "C" ? 195 : 168;
  const ctaAlign: "center" | "left" = preset.id === "B" ? "left" : "center";
  const overlayStart = preset.id === "C" ? 0.5 : 0.55;
  const ov = Math.max(0.3, image.overlay / 100);

  return (
    <>
      <ImageBg image={image} />

      {/* Top shadow to make red title readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 18%, rgba(0,0,0,0) 30%)`,
        }}
      />

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0) ${overlayStart * 100}%, rgba(0,0,0,${ov * 0.85}) 78%, rgba(0,0,0,${Math.min(ov + 0.2, 0.98)}) 100%)`,
        }}
      />

      {/* Date box top-right */}
      {(dia || mes) && (
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 70,
            width: dateBoxSize,
            height: dateBoxSize,
            background: RED,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: BEBAS,
            lineHeight: 0.85,
            paddingTop: 8,
          }}
        >
          <span style={{ fontSize: dateBoxSize * 0.62, letterSpacing: "-0.02em" }}>{dia || "—"}</span>
          <span style={{ fontSize: dateBoxSize * 0.18, letterSpacing: "0.08em", marginTop: 10 }}>{mes}</span>
        </div>
      )}

      {/* Big PROGRAMACIÓN title */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 70,
          right: dateBoxSize + 110,
          fontFamily: BEBAS,
          color: RED,
          fontSize: titleSize,
          lineHeight: 0.88,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
        }}
      >
        {family.label}
      </div>

      {/* Bottom content block */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: ctaAlign === "center" ? "center" : "flex-start",
          gap: 22,
          color: CREMA,
          textAlign: ctaAlign,
        }}
      >
        {titulo && (
          <div
            style={{
              fontFamily: BEBAS,
              fontSize: titulo.length > 24 ? 64 : 76,
              lineHeight: 0.95,
              letterSpacing: "0.01em",
              color: "#fff",
              maxWidth: "100%",
              wordBreak: "break-word",
            }}
          >
            «{titulo}»
          </div>
        )}
        {(hora || publico) && (
          <div
            style={{
              fontFamily: BEBAS,
              fontSize: 40,
              lineHeight: 1,
              letterSpacing: "0.06em",
              color: "#fff",
              opacity: 0.95,
            }}
          >
            {[hora, publico].filter(Boolean).join("  ·  ")}
          </div>
        )}
        {cta && (
          <div
            style={{
              marginTop: 8,
              background: RED,
              color: "#fff",
              fontFamily: BEBAS,
              fontSize: 38,
              letterSpacing: "0.08em",
              padding: "20px 38px",
              minWidth: 330,
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            {cta}
          </div>
        )}
      </div>
    </>
  );
}

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
  const verticalSide: "right" | "left" = preset.id === "B" ? "left" : "right";
  const verticalOpacity = preset.id === "C" ? 0.55 : 0.95;
  const blockBottom = preset.id === "C" ? 200 : 90;
  const ov = image.overlay / 100;

  // vertical text — rotate via writing-mode
  const verticalStyle: React.CSSProperties = {
    position: "absolute",
    top: 80,
    bottom: 80,
    [verticalSide]: 60,
    fontFamily: BEBAS,
    color: PLUM,
    fontSize: 168,
    lineHeight: 0.85,
    letterSpacing: "0.02em",
    writingMode: "vertical-rl",
    transform: verticalSide === "left" ? "rotate(180deg)" : "none",
    opacity: verticalOpacity,
    textTransform: "uppercase",
    display: "flex",
    alignItems: verticalSide === "left" ? "flex-end" : "flex-start",
  };

  return (
    <>
      <ImageBg image={image} />

      {/* Diagonal-ish dark overlay: stronger on bottom-left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,${Math.max(0.35, ov)}) 95%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${verticalSide === "right" ? "270deg" : "90deg"}, rgba(0,0,0,0) 55%, rgba(0,0,0,${ov * 0.5}) 100%)`,
        }}
      />

      {/* Vertical RESIDENCIAS */}
      <div style={verticalStyle}>{family.label}</div>

      {/* Bottom-left block */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 220,
          bottom: blockBottom,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {artista && (
          <div
            style={{
              fontFamily: BEBAS,
              color: PLUM,
              fontSize: artista.length > 22 ? 70 : 84,
              lineHeight: 0.9,
              letterSpacing: "0.01em",
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
              fontSize: titulo.length > 24 ? 52 : 62,
              lineHeight: 0.95,
              letterSpacing: "0.01em",
            }}
          >
            «{titulo}»
          </div>
        )}
        {programa && (
          <div
            style={{
              fontFamily: DM,
              color: "#fff",
              fontSize: 26,
              letterSpacing: "0.16em",
              lineHeight: 1.3,
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

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { family, template, preset, format, values, image, scale },
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
