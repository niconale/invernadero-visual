import { forwardRef, useRef, useCallback } from "react";
import { FORMATS } from "@/families/types";
import type { FamilyDefinition, TemplateDefinition, LayoutPreset, FieldValues, FormatId, BlockDef, ColorRole } from "@/families/types";
import type { ImageState, MaskState, BlockPositions, BlockBooleans, BlockSizes } from "@/store/editor";
import { blockKey } from "@/store/editor";

interface CanvasProps {
  family: FamilyDefinition;
  template: TemplateDefinition;
  preset: LayoutPreset;
  format: FormatId;
  values: FieldValues;
  image: ImageState;
  mask: MaskState;
  scale: number;
  blockPositions: BlockPositions;
  hiddenBlocks: BlockBooleans;
  blockSizes: BlockSizes;
  mergeHoraPublico: boolean;
  onBlockMove: (blockId: string, pos: { x: number; y: number }) => void;
  useSingleQuotes: boolean;
  snapping: boolean;
  showSafeZone: boolean;
  interactive: boolean;
}

const BEBAS = '"Bebas Neue", "DM Sans", sans-serif';
const DM = '"DM Sans", sans-serif';
const CREMA = "#F3EDE0";

function quoted(s: string, useSingle: boolean): string {
  const t = s.trim();
  if (!t) return "";
  if (!useSingle) return t;
  if (/^['']/.test(t)) return t;
  return `'${t}'`;
}

function roleToColor(role: ColorRole, family: FamilyDefinition): string {
  if (role === "family") return family.color;
  if (role === "cream") return CREMA;
  return "#FFFFFF";
}

function ImageBg({ image }: { image: ImageState }) {
  if (!image.url) return <div style={{ position: "absolute", inset: 0, background: "#1a1a1a" }} />;
  const b = 0.5 + image.brightness / 100;
  return (
    <img
      src={image.url} alt="" crossOrigin="anonymous"
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        transform: `translate(${image.x}%, ${image.y}%) scale(${image.zoom})`,
        filter: `brightness(${b})`,
      }}
    />
  );
}

/** Graduated masks: each side has intensity + reach. Feather softens the falloff. */
function MaskLayer({ mask, image }: { mask: MaskState; image: ImageState }) {
  const overlay = image.overlay / 100; // base flat overlay
  // Reach: fraction of canvas the mask covers from each edge.
  const reach = 0.15 + (mask.size / 100) * 0.55; // 0.15..0.7
  // Feather: how soft the inner edge is. Higher = softer.
  const f = 0.3 + (mask.feather / 100) * 0.7; // 0.3..1.0
  // Each side intensity (0..1)
  const sides: Array<[string, number, string]> = [
    ["180deg", mask.top / 100, "top"],
    ["0deg", mask.bottom / 100, "bottom"],
    ["90deg", mask.left / 100, "left"],
    ["270deg", mask.right / 100, "right"],
  ];
  const stopEnd = `${(reach * 100).toFixed(1)}%`;
  const stopMid = `${(reach * 100 * (1 - f * 0.6)).toFixed(1)}%`;
  return (
    <>
      {/* Flat overlay */}
      {overlay > 0 && (
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlay})` }} />
      )}
      {sides.map(([angle, intensity, key]) =>
        intensity <= 0 ? null : (
          <div
            key={key}
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(${angle},
                rgba(0,0,0,${(intensity * 0.95).toFixed(3)}) 0%,
                rgba(0,0,0,${(intensity * 0.6).toFixed(3)}) ${stopMid},
                rgba(0,0,0,0) ${stopEnd})`,
              mixBlendMode: "multiply",
            }}
          />
        ),
      )}
      {mask.vignette > 0 && (
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at center,
              rgba(0,0,0,0) 45%,
              rgba(0,0,0,${(mask.vignette / 100 * 0.7).toFixed(3)}) 100%)`,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </>
  );
}

function applyOverrides(block: BlockDef, preset: LayoutPreset): BlockDef {
  const ov = preset.overrides?.[block.id];
  return ov ? { ...block, ...ov } : block;
}

function blockText(block: BlockDef, values: FieldValues, useSingleQuotes: boolean): string {
  const raw = block.bind ? (values[block.bind] || "") : (block.staticText || "");
  let t = raw;
  if (block.uppercase) t = t.toUpperCase();
  if (block.quote) t = quoted(t, useSingleQuotes);
  return t;
}

interface DraggableProps {
  block: BlockDef;
  effectivePos: { x: number; y: number };
  onMove: (pos: { x: number; y: number }) => void;
  scale: number;
  canvasW: number;
  canvasH: number;
  snapping: boolean;
  interactive: boolean;
  children: React.ReactNode;
}

function Draggable({ block, effectivePos, onMove, scale, canvasW, canvasH, snapping, interactive, children }: DraggableProps) {
  const dragState = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, baseX: effectivePos.x, baseY: effectivePos.y };
  }, [interactive, effectivePos.x, effectivePos.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dxPx = (e.clientX - dragState.current.startX) / scale;
    const dyPx = (e.clientY - dragState.current.startY) / scale;
    let nx = dragState.current.baseX + (dxPx / canvasW) * 100;
    let ny = dragState.current.baseY + (dyPx / canvasH) * 100;
    if (snapping) {
      nx = Math.round(nx / 2.5) * 2.5;
      ny = Math.round(ny / 2.5) * 2.5;
    }
    nx = Math.max(0, Math.min(100, nx));
    ny = Math.max(0, Math.min(100, ny));
    onMove({ x: nx, y: ny });
  }, [scale, canvasW, canvasH, snapping, onMove]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragState.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  const translate =
    block.align === "center" ? "translate(-50%, 0)" :
    block.align === "right" ? "translate(-100%, 0)" : "translate(0, 0)";

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute",
        left: `${effectivePos.x}%`,
        top: `${effectivePos.y}%`,
        transform: translate,
        touchAction: "none",
        cursor: interactive ? "move" : "default",
        outline: interactive ? "1px dashed rgba(255,255,255,0.0)" : "none",
        transition: "outline-color 120ms",
      }}
      onMouseEnter={(e) => { if (interactive) (e.currentTarget as HTMLElement).style.outlineColor = "rgba(255,255,255,0.5)"; }}
      onMouseLeave={(e) => { if (interactive) (e.currentTarget as HTMLElement).style.outlineColor = "rgba(255,255,255,0)"; }}
    >
      {children}
    </div>
  );
}

function BlockRender({
  block, family, values, useSingleQuotes,
}: { block: BlockDef; family: FamilyDefinition; values: FieldValues; useSingleQuotes: boolean }) {
  const color = roleToColor(block.color, family);
  const bg = block.background ? roleToColor(block.background, family) : undefined;
  const fontFamily = block.fontFamily === "dm" ? DM : BEBAS;
  const base: React.CSSProperties = {
    fontFamily,
    color,
    fontSize: block.fontSize,
    lineHeight: block.lineHeight ?? 1,
    letterSpacing: block.letterSpacing ?? "0em",
    fontWeight: block.weight as any,
    textTransform: block.uppercase ? "uppercase" : "none",
    textShadow: bg ? "none" : "0 2px 14px rgba(0,0,0,0.35)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxWidth: block.maxW ? `${(block.maxW / 100) * 1080}px` : undefined,
    textAlign: block.align as any,
  };

  if (block.kind === "date-box") {
    const dia = (values.dia || "").trim();
    const mes = (values.mes || "").trim().toUpperCase();
    const size = block.fontSize * 1.55;
    return (
      <div
        style={{
          background: bg, color, width: size, height: size,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontFamily, lineHeight: 0.82, paddingTop: 6,
          boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
        }}
      >
        <span style={{ fontSize: block.fontSize, letterSpacing: "-0.02em" }}>{dia || "—"}</span>
        <span style={{ fontSize: block.fontSize * (block.monthScale ?? 0.27), letterSpacing: "0.1em", marginTop: 10 }}>{mes}</span>
      </div>
    );
  }

  if (block.kind === "cta") {
    const text = blockText(block, values, useSingleQuotes);
    if (!text) return null;
    return (
      <div
        style={{
          ...base,
          background: bg,
          padding: `${block.padding ?? 20}px ${(block.padding ?? 20) * 2}px`,
          boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
          textShadow: "none",
        }}
      >
        {text}
      </div>
    );
  }

  if (block.kind === "vertical") {
    const text = blockText(block, values, useSingleQuotes);
    return (
      <div
        style={{
          ...base,
          writingMode: "vertical-rl",
          textAlign: "left",
          maxWidth: undefined,
        }}
      >
        {text}
      </div>
    );
  }

  // text
  const text = blockText(block, values, useSingleQuotes);
  if (!text) return null;
  return <div style={base}>{text}</div>;
}

/* ────────────────── Canvas wrapper ────────────────── */

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { family, template, preset, format, values, image, mask, scale,
    blockPositions, hiddenBlocks, blockSizes, mergeHoraPublico,
    onBlockMove, useSingleQuotes, snapping, showSafeZone, interactive },
  ref,
) {
  const dims = FORMATS[format];

  return (
    <div
      style={{
        width: dims.w * scale, height: dims.h * scale,
        position: "relative", overflow: "hidden",
        background: "#0a0a0a", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}
    >
      <div
        ref={ref}
        style={{
          width: dims.w, height: dims.h,
          transform: `scale(${scale})`, transformOrigin: "top left",
          position: "relative", overflow: "hidden", background: "#0a0a0a",
        }}
      >
        <ImageBg image={image} />
        <MaskLayer mask={mask} image={image} />

        {showSafeZone && interactive && (
          <div
            aria-hidden
            style={{
              position: "absolute", inset: `${dims.h * 0.05}px ${dims.w * 0.06}px`,
              border: "2px dashed rgba(255,255,255,0.35)", pointerEvents: "none",
            }}
          />
        )}

        {template.blocks.map((b) => {
          let blk = applyOverrides(b, preset);
          const key = blockKey(family.id, template.id, blk.id);

          // Programación: merge hora + público
          if (family.id === "programacion" && mergeHoraPublico) {
            if (blk.id === "publico") return null; // hide
            if (blk.id === "hora") {
              const hora = (values.hora || "").trim();
              const pub = (values.publico || "").trim();
              const merged = [hora, pub].filter(Boolean).join(" · ");
              blk = { ...blk, bind: undefined, staticText: merged };
            }
          }

          if (hiddenBlocks[key]) return null;

          const sizeMult = blockSizes[key] ?? 1;
          if (sizeMult !== 1) {
            blk = { ...blk, fontSize: blk.fontSize * sizeMult };
          }

          const custom = blockPositions[key];
          const pos = custom ?? { x: blk.x, y: blk.y };
          return (
            <Draggable
              key={blk.id}
              block={blk}
              effectivePos={pos}
              onMove={(p) => onBlockMove(blk.id, p)}
              scale={scale}
              canvasW={dims.w}
              canvasH={dims.h}
              snapping={snapping}
              interactive={interactive}
            >
              <BlockRender block={blk} family={family} values={values} useSingleQuotes={useSingleQuotes} />
            </Draggable>
          );
        })}
      </div>
    </div>
  );
});
