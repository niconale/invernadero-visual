import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  familia: z.string(),
  plantilla: z.string(),
  valores: z.record(z.string(), z.string()),
  referencias: z.string().optional(),
});

/** Brand voice guide for El Invernadero Circo. Kept in code so the prompt is stable. */
const BRAND_VOICE = `
Tono editorial de El Invernadero Circo (espacio de circo contemporáneo, Argentina):
- Claro, directo, cercano, profesional. Cálido pero sobrio.
- Lenguaje cultural y artístico, accesible. Nunca cursi ni grandilocuente.
- Prohibido: "la magia del circo", "vivir una experiencia única", frases tipo publicidad de gimnasio, signos de exclamación múltiples, hashtags, emojis decorativos en cadena (máximo 1 emoji si suma, mejor ninguno).
- Para PROGRAMACIÓN: informativo y orientado a la acción. Mencionar título, fecha, hora, público, entradas o cómo asistir. Útil, concreto.
- Para RESIDENCIAS: tono curatorial pero sencillo. Hablar de proceso, investigación, compañía, acompañamiento, programa. Sin venderlo, contarlo.
- Largo objetivo: 1 a 3 frases cortas, máximo ~180 caracteres por variante.
- Español rioplatense neutro (vos / usted según corresponda; preferir vos para audiencia general, sin abusar).
`.trim();

function localFallback(familia: string, valores: Record<string, string>): string[] {
  const titulo = valores.titulo || "una nueva obra";
  if (familia === "programacion") {
    const dia = valores.dia, mes = valores.mes, hora = valores.hora;
    const fecha = [dia && mes ? `${dia} de ${mes.toLowerCase()}` : "", hora].filter(Boolean).join(", ");
    return [
      `'${titulo}' en El Invernadero${fecha ? ` — ${fecha}` : ""}. Entradas disponibles.`,
      `Esta semana en sala: '${titulo}'${valores.publico ? `. ${valores.publico.toLowerCase()}.` : "."}`,
      `Reservá tu lugar para '${titulo}'${fecha ? ` (${fecha})` : ""}.`,
    ];
  }
  const artista = valores.artista || "una nueva compañía";
  return [
    `${artista} en residencia con '${titulo}'. Compartimos parte del proceso.`,
    `Residencia en curso: ${artista} trabaja sobre '${titulo}'.`,
    `Acompañamos a ${artista} en el desarrollo de '${titulo}' dentro del programa.`,
  ];
}

export const generateCopy = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { copies: localFallback(data.familia, data.valores), source: "local" as const };
    }
    try {
      const { createOpenAICompatible } = await import("@ai-sdk/openai-compatible");
      const { generateObject } = await import("ai");
      const provider = createOpenAICompatible({
        name: "lovable",
        baseURL: "https://ai.gateway.lovable.dev/v1",
        headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      });

      const refsBlock = (data.referencias || "").trim()
        ? `\n\nEjemplos REALES de captions de su Instagram (usá estos como referencia de tono, ritmo y vocabulario — NO los copies):\n"""\n${data.referencias!.trim().slice(0, 3000)}\n"""\n`
        : "";

      const prompt = `${BRAND_VOICE}
${refsBlock}
Familia: ${data.familia}
Plantilla: ${data.plantilla}
Datos del posteo (en mayúsculas como en el arte, normalizá al escribir): ${JSON.stringify(data.valores)}

Generá 3 variantes de caption para Instagram que respeten ESTRICTAMENTE el tono descrito.
Cada variante: 1–3 frases cortas, máx 180 caracteres. Sin hashtags. Sin emojis (o máximo uno solo si suma).
Si el título lleva comillas, usá comillas simples: 'título'.
`;

      const { object } = await generateObject({
        model: provider("google/gemini-3-flash-preview"),
        schema: z.object({ copies: z.array(z.string()).length(3) }),
        prompt,
      });
      return { copies: object.copies, source: "ai" as const };
    } catch (e) {
      console.error("AI copy failed", e);
      return { copies: localFallback(data.familia, data.valores), source: "local" as const };
    }
  });
