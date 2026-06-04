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

export async function exportNode(
  node: HTMLElement,
  format: "png" | "jpg",
  width: number,
  height: number,
  filename: string,
) {
  const opts = {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    style: { transform: "none", transformOrigin: "top left" },
  } as const;
  const dataUrl = format === "png" ? await toPng(node, opts) : await toJpeg(node, { ...opts, quality: 0.94 });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
