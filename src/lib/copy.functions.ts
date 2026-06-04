import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  familia: z.string(),
  plantilla: z.string(),
  valores: z.record(z.string(), z.string()),
});

function localFallback(familia: string, valores: Record<string, string>): string[] {
  const titulo = valores.titulo || "tu pieza";
  if (familia === "programacion") {
    return [
      `${titulo} llega al Invernadero. Reservá tu lugar.`,
      `Nueva función: ${titulo}. Te esperamos.`,
      `${titulo} — una noche para no perderse.`,
    ];
  }
  return [
    `Compartimos un nuevo proceso en residencia: ${titulo}.`,
    `Residencia en curso: ${titulo}. Acompañamos su germinación.`,
    `${titulo} crece en El Invernadero.`,
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
        apiKey,
        baseURL: "https://ai.gateway.lovable.dev/v1",
      });
      const prompt = `Sos redactor de El Invernadero Circo (espacio de circo contemporáneo, tono cálido y sobrio, en español rioplatense). Generá 3 variantes cortas de copy para Instagram (máx 180 caracteres c/u) para la familia "${data.familia}". Datos: ${JSON.stringify(data.valores)}. No uses hashtags ni emojis excesivos. Sin signos exclamativos múltiples.`;
      const { object } = await generateObject({
        model: provider("google/gemini-2.5-flash"),
        schema: z.object({ copies: z.array(z.string()).length(3) }),
        prompt,
      });
      return { copies: object.copies, source: "ai" as const };
    } catch (e) {
      console.error("AI copy failed", e);
      return { copies: localFallback(data.familia, data.valores), source: "local" as const };
    }
  });
