import { forwardRef, useRef, useCallback } from "react";
import { FORMATS } from "@/families/types";
import type { FamilyDefinition, TemplateDefinition, LayoutPreset, FieldValues, FormatId, BlockDef, ColorRole } from "@/families/types";
import type { ImageState, MaskState, BlockPositions, BlockBooleans, BlockSizes } from "@/store/editor";
import { blockKey, posKey, useEditor } from "@/store/editor";

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
  blockNoWrap: BlockBooleans;
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
  if (role === "dark") return family.colorDark;
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
  // Each side intensity (0..1). Top gets a small extra ceiling for legibility.
  const topIntensity = Math.min(1, (mask.top / 100) * 1.15);
  const sides: Array<[string, number, string, number]> = [
    // [angle, intensity, key, reach]
    ["180deg", topIntensity, "top", Math.min(0.95, reach + 0.25)],
    ["0deg", mask.bottom / 100, "bottom", reach],
    ["90deg", mask.left / 100, "left", reach],
    ["270deg", mask.right / 100, "right", reach],
  ];
  return (
    <>
      {/* Flat overlay */}
      {overlay > 0 && (
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${overlay})` }} />
      )}
      {sides.map(([angle, intensity, key, sideReach]) => {
        if ((intensity as number) <= 0) return null;
        const stopEnd = `${((sideReach as number) * 100).toFixed(1)}%`;
        const stopMid = `${((sideReach as number) * 100 * (1 - f * 0.6)).toFixed(1)}%`;
        return (
          <div
            key={key as string}
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(${angle},
                rgba(0,0,0,${((intensity as number) * 0.95).toFixed(3)}) 0%,
                rgba(0,0,0,${((intensity as number) * 0.6).toFixed(3)}) ${stopMid},
                rgba(0,0,0,0) ${stopEnd})`,
              mixBlendMode: "multiply",
            }}
          />
        );
      })}
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

/* ────────────────── Guías móviles (escuela / residencias) ────────────────── */

function Guides({ format, canvasW, canvasH, scale }: { format: FormatId; canvasW: number; canvasH: number; scale: number }) {
  // import lazy via dynamic hook to avoid changing top imports
  const { useEditor } = require("@/store/editor") as typeof import("@/store/editor");
  const guideX = useEditor((s) => s.guides[format].x);
  const guideY = useEditor((s) => s.guides[format].y);
  const showX = useEditor((s) => s.guides[format].showX);
  const showY = useEditor((s) => s.guides[format].showY);
  const setGuide = useEditor((s) => s.setGuide);

  const dragV = useRef<{ start: number; base: number } | null>(null);
  const dragH = useRef<{ start: number; base: number } | null>(null);

  if (!showX && !showY) return null;

  return (
    <>
      {showX && (
        <div
          onPointerDown={(e) => { e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); dragV.current = { start: e.clientX, base: guideX }; }}
          onPointerMove={(e) => {
            if (!dragV.current) return;
            const dx = (e.clientX - dragV.current.start) / scale;
            const nx = Math.max(0, Math.min(100, dragV.current.base + (dx / canvasW) * 100));
            setGuide(format, { x: nx });
          }}
          onPointerUp={(e) => { dragV.current = null; try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {} }}
          style={{
            position: "absolute", top: 0, bottom: 0, left: `${guideX}%`,
            width: 14, transform: "translateX(-50%)", cursor: "ew-resize", touchAction: "none", zIndex: 50,
          }}
        >
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "#22D3EE", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.4)" }} />
        </div>
      )}
      {showY && (
        <div
          onPointerDown={(e) => { e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); dragH.current = { start: e.clientY, base: guideY }; }}
          onPointerMove={(e) => {
            if (!dragH.current) return;
            const dy = (e.clientY - dragH.current.start) / scale;
            const ny = Math.max(0, Math.min(100, dragH.current.base + (dy / canvasH) * 100));
            setGuide(format, { y: ny });
          }}
          onPointerUp={(e) => { dragH.current = null; try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {} }}
          style={{
            position: "absolute", left: 0, right: 0, top: `${guideY}%`,
            height: 14, transform: "translateY(-50%)", cursor: "ns-resize", touchAction: "none", zIndex: 50,
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "#22D3EE", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.4)" }} />
        </div>
      )}
    </>
  );
}


function BlockRender({
  block, family, values, useSingleQuotes, canvasW, canvasH,
}: { block: BlockDef; family: FamilyDefinition; values: FieldValues; useSingleQuotes: boolean; canvasW: number; canvasH: number }) {
  const color = roleToColor(block.color, family);
  const bg = block.background ? roleToColor(block.background, family) : undefined;
  const fontFamily = block.fontFamily === "dm" ? DM : BEBAS;
  const isFamilyTitle = block.id === "titleFamily";
  const nowrap = !!block.noWrap;
  const base: React.CSSProperties = {
    fontFamily,
    color,
    fontSize: block.fontSize,
    lineHeight: block.lineHeight ?? 1,
    letterSpacing: block.letterSpacing ?? "0em",
    fontWeight: block.weight as any,
    textTransform: block.uppercase ? "uppercase" : "none",
    textShadow: bg ? "none" : "0 2px 14px rgba(0,0,0,0.35)",
    whiteSpace: nowrap || isFamilyTitle ? "nowrap" : "pre-wrap",
    wordBreak: nowrap || isFamilyTitle ? "normal" : "break-word",
    overflow: "visible",
    maxWidth: nowrap || isFamilyTitle ? "none" : (block.maxW ? `${(block.maxW / 100) * canvasW}px` : undefined),
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

  if (block.kind === "panel") {
    const wPx = ((block.panelW ?? 100) / 100) * canvasW;
    const hPx = ((block.panelH ?? 35) / 100) * canvasH;
    const op = block.bgOpacity ?? 0.85;
    const borderTop = block.borderTopColor
      ? `${block.borderTopWidth ?? 4}px solid ${roleToColor(block.borderTopColor, family)}`
      : undefined;
    return (
      <div
        style={{
          width: wPx,
          height: hPx,
          background: bg ?? "#000",
          opacity: op,
          borderTop,
          pointerEvents: "none",
        }}
      />
    );
  }

  if (block.kind === "data-stack") {
    const main = blockText(block, values, useSingleQuotes);
    const labelRaw = block.bindLabel ? (values[block.bindLabel] || "") : (block.staticLabel || "");
    const label = (labelRaw || "").toUpperCase();
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: block.align === "right" ? "flex-end" : block.align === "center" ? "center" : "flex-start", textShadow: "0 2px 14px rgba(0,0,0,0.35)" }}>
        <div style={{ ...base, textShadow: "0 2px 14px rgba(0,0,0,0.35)" }}>{main}</div>
        {label && (
          <div style={{
            fontFamily: DM, color: roleToColor(block.color, family),
            fontSize: block.labelSize ?? 18, letterSpacing: "0.18em",
            fontWeight: 500, marginTop: 6, opacity: 0.85,
          }}>{label}</div>
        )}
      </div>
    );
  }

  if (block.kind === "logo") {
    if (!block.imageUrl) return null;
    const w = block.logoWidth ?? 180;
    const white = block.logoWhite !== false;
    return (
      <img
        src={block.imageUrl}
        alt=""
        crossOrigin="anonymous"
        style={{
          width: w,
          height: "auto",
          display: "block",
          filter: white ? "brightness(0) invert(1)" : undefined,
          pointerEvents: "none",
        }}
      />
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
    blockPositions, hiddenBlocks, blockSizes, blockNoWrap, mergeHoraPublico,
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

        {showSafeZone && interactive && (() => {
          // Instagram-safe: Feed 4:5 ~5%/6%; Story 9:16 ~14% top + 16% bottom (UI overlays), ~5% lados.
          const insetTop = format === "9:16" ? dims.h * 0.14 : dims.h * 0.05;
          const insetBottom = format === "9:16" ? dims.h * 0.16 : dims.h * 0.05;
          const insetX = format === "9:16" ? dims.w * 0.05 : dims.w * 0.06;
          return (
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: insetTop, bottom: insetBottom, left: insetX, right: insetX,
                border: "2px dashed rgba(255,255,255,0.35)", pointerEvents: "none",
              }}
            />
          );
        })()}

        {interactive && (family.id === "escuela" || family.id === "residencias") && (
          <Guides format={format} canvasW={dims.w} canvasH={dims.h} scale={scale} />
        )}

        {template.blocks.map((b) => {
          let blk = applyOverrides(b, preset);
          if (format === "9:16" && b.storyOverrides) {
            blk = { ...blk, ...b.storyOverrides };
          }
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
            blk = {
              ...blk,
              fontSize: blk.fontSize * sizeMult,
              logoWidth: blk.logoWidth ? blk.logoWidth * sizeMult : blk.logoWidth,
              panelW: blk.kind === "panel" && blk.panelW != null ? blk.panelW * sizeMult : blk.panelW,
              panelH: blk.kind === "panel" && blk.panelH != null ? blk.panelH * sizeMult : blk.panelH,
            };
          }
          if (blk.wrapControl) {
            const nw = blockNoWrap[key];
            blk = { ...blk, noWrap: nw !== undefined ? nw : !!blk.defaultNoWrap };
          }

          const pkey = posKey(family.id, template.id, blk.id, format);
          const custom = blockPositions[pkey] ?? blockPositions[key];
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
              <BlockRender block={blk} family={family} values={values} useSingleQuotes={useSingleQuotes} canvasW={dims.w} canvasH={dims.h} />
            </Draggable>
          );
        })}
      </div>
    </div>
  );
});
