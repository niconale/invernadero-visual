import { toPng, toJpeg } from "html-to-image";

export function slugify(s: string): string {
  return (s || "pieza")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Wait for all <img> inside node to be fully loaded (or fail) so html-to-image
 *  doesn't snapshot a half-rendered canvas. Blob URLs and assets without CORS
 *  headers are tolerated — we just don't block forever. */
async function waitForImages(node: HTMLElement, timeoutMs = 8000): Promise<void> {
  const imgs = Array.from(node.querySelectorAll("img"));
  if (imgs.length === 0) return;
  const each = imgs.map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }),
  );
  await Promise.race([
    Promise.all(each).then(() => undefined),
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ]);
}

export async function exportNode(
  node: HTMLElement,
  format: "png" | "jpg",
  width: number,
  height: number,
  filename: string,
) {
  // 1) Asegurar fuentes cargadas (Bebas Neue, DM Sans).
  try {
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }
  } catch (e) {
    console.warn("[export] fonts.ready failed", e);
  }

  // 2) Esperar a que las imágenes (foto + logo) terminen de cargar.
  await waitForImages(node);

  // 3) html-to-image: anula el transform/scale del preview y exporta al tamaño real.
  const opts = {
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: false,
    style: {
      transform: "none",
      transformOrigin: "top left",
      width: `${width}px`,
      height: `${height}px`,
    },
    fetchRequestInit: { mode: "cors" as RequestMode },
  } as const;

  let dataUrl: string;
  try {
    dataUrl =
      format === "png"
        ? await toPng(node, opts)
        : await toJpeg(node, { ...opts, quality: 0.94, backgroundColor: "#0a0a0a" });
  } catch (e) {
    console.error("[export] html-to-image failed", e);
    throw new Error("EXPORT_RENDER_FAILED");
  }

  if (!dataUrl || dataUrl.length < 100) {
    throw new Error("EXPORT_EMPTY");
  }

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
