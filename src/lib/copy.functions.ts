import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  familia: z.string(),
  plantilla: z.string(),
  valores: z.record(z.string(), z.string()),
  referencias: z.string().optional(),
  contexto: z.string().optional(),
});

export type CopyResult = {
  principal: string;
  corta: string;
  cta: string;
  hashtags: string[];
  stories: string[];
};

const BRAND_VOICE = `
GUÍA DE TONO — INSTAGRAM EL INVERNADERO CIRCO (Alcobendas, circo contemporáneo)

TONO GENERAL: claro, directo, profesional, cercano, sobrio, cultural pero accesible.
Informativo antes que publicitario. Sensibilidad hacia proceso y entrenamiento.
Sin exageración. Sin cursilería. Sin frases vacías.

NO debe sonar como: escuela genérica, campaña de gimnasio, publicidad de ocio familiar,
comunicación institucional fría, copy poético forzado.

PROHIBIDO USAR (nunca): "la magia del circo", "una experiencia única",
"ven a vivir una aventura", "sumérgete en...", "no te lo puedes perder",
exceso de emojis, exceso de signos de exclamación, frases grandilocuentes,
lenguaje infantilizante.

VOCABULARIO QUE SÍ: espacio, entrenamiento, proceso, creación, residencia,
investigación, técnica, cuerpo, compañía, artistas, programación, función,
público familiar, Alcobendas, circo contemporáneo, profesional, comunidad,
plazas, inscripción, entradas, reserva.

REGLAS DURAS:
- No empezar con frases abstractas.
- No inventar información: usá SOLO los datos provistos. Si un dato falta, omitilo.
- No usar emojis por defecto (idealmente ninguno).
- No meter hashtags dentro del cuerpo del copy.
- Si un título lleva comillas, usá comillas simples: 'título'.
- Español neutro de España (usted/tú según convenga; preferir tú; "reserva", "entradas", "inscripciones").
`.trim();

const PROGRAMACION_BLOCK = `
FAMILIA: PROGRAMACIÓN
Tono: claro, práctico, orientado a asistencia, cercano pero no comercial.
Estructura sugerida del copy principal:
1) "[Fecha o contexto] abrimos programación en El Invernadero con '[título]', de [compañía/artista]."
2) "Una propuesta de [disciplina/tono] dirigida a [tipo de público]."
3) Datos concretos: "[Fecha] · [hora]".
4) Cierre con CTA directo: "Entradas disponibles en el enlace de la bio." / "Reserva tu entrada."
SIEMPRE incluir, si existen: título, fecha (día + mes), hora, tipo de público, entradas.
HASHTAGS exactos a usar (5): #CircoContemporáneo #Alcobendas #ProgramaciónCultural #ElInvernaderoCirco #PDCirco
`.trim();

const RESIDENCIAS_BLOCK = `
FAMILIA: RESIDENCIAS
Tono: curatorial, centrado en proceso, sobrio, profesional. Sin vender humo.
Estructura sugerida del copy principal:
1) "Durante estos días, [artista/compañía] trabaja en El Invernadero con el proyecto '[título]'."
2) "La residencia abre un espacio para investigar [línea/proceso/disciplina], probar materiales y avanzar en la creación."
3) Mencionar el programa / línea de residencia.
CTA opcional: "Seguimos compartiendo proceso." / "Pronto más sobre esta residencia." / "Conoce más sobre el programa de residencias."
HASHTAGS exactos a usar (5): #ResidenciasArtísticas #CircoContemporáneo #CreaciónCircense #ElInvernaderoCirco #PDCirco
`.trim();

const ESCUELA_BLOCK = `
FAMILIA: ESCUELA · VERANO
Tono: formativo, claro, práctico, directo, orientado a inscripción.
Estructura sugerida del copy principal:
1) "Este verano seguimos entrenando en El Invernadero."
2) "[Disciplina/título] forma parte de Escuela · Verano, con sesiones para [nivel/público] los días [fechas], en horario de [horario]."
3) "Precio: [precio]."
4) "Inscripciones abiertas."
CTA: "Reserva tu plaza." / "Inscripciones abiertas." / "Escríbenos para más información."
HASHTAGS exactos a usar (5): #EscuelaDeCirco #CircoContemporáneo #Entrenamiento #ElInvernaderoCirco #Alcobendas
`.trim();

function familyBlock(familia: string): string {
  if (familia === "residencias") return RESIDENCIAS_BLOCK;
  if (familia === "escuela") return ESCUELA_BLOCK;
  return PROGRAMACION_BLOCK;
}

function defaultHashtags(familia: string): string[] {
  if (familia === "residencias")
    return ["#ResidenciasArtísticas", "#CircoContemporáneo", "#CreaciónCircense", "#ElInvernaderoCirco", "#PDCirco"];
  if (familia === "escuela")
    return ["#EscuelaDeCirco", "#CircoContemporáneo", "#Entrenamiento", "#ElInvernaderoCirco", "#Alcobendas"];
  return ["#CircoContemporáneo", "#Alcobendas", "#ProgramaciónCultural", "#ElInvernaderoCirco", "#PDCirco"];
}

function tc(s: string | undefined): string {
  if (!s) return "";
  const t = s.trim();
  if (!t) return "";
  // Si viene todo en mayúsculas, normalizar a "Capitalización tipo título suave"
  if (t === t.toUpperCase() && t.length > 3) {
    return t
      .toLowerCase()
      .replace(/(^|\s|·|-|\/)([a-záéíóúñ])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  }
  return t;
}

function localFallback(familia: string, valores: Record<string, string>): CopyResult {
  const hashtags = defaultHashtags(familia);

  if (familia === "programacion") {
    const titulo = tc(valores.titulo) || "una nueva propuesta";
    const dia = valores.dia?.trim();
    const mes = tc(valores.mes);
    const hora = valores.hora?.trim();
    const publico = tc(valores.publico) || "público familiar";
    const fecha = dia && mes ? `${dia} de ${mes}` : "";
    const fechaHora = [fecha, hora].filter(Boolean).join(" · ");
    const principal =
      `Abrimos programación en El Invernadero con '${titulo}'.` +
      ` Una propuesta de circo contemporáneo dirigida a ${publico.toLowerCase()}.` +
      (fechaHora ? `\n${fechaHora}.` : "") +
      `\nEntradas disponibles en el enlace de la bio.`;
    const corta = `'${titulo}' en El Invernadero${fechaHora ? ` — ${fechaHora}` : ""}. Entradas en bio.`;
    const cta = "Entradas disponibles en el enlace de la bio.";
    const stories = [
      `Esta semana en sala: '${titulo}'.`,
      fechaHora ? `${fechaHora} · ${publico}.` : `${publico}.`,
      "Entradas disponibles.",
      "Más info en el enlace de la bio.",
    ];
    return { principal, corta, cta, hashtags, stories };
  }

  if (familia === "residencias") {
    const artista = tc(valores.artista) || "una compañía residente";
    const titulo = tc(valores.titulo) || "su nuevo proyecto";
    const programa = tc(valores.programa) || "Programa de Residencias";
    const principal =
      `Durante estos días, ${artista} trabaja en El Invernadero con el proyecto '${titulo}'.` +
      `\nLa residencia abre un espacio para investigar, probar materiales y avanzar en la creación.` +
      `\n${programa}.`;
    const corta = `Residencia en curso: ${artista} con '${titulo}'.`;
    const cta = "Seguimos compartiendo proceso.";
    const stories = [
      `Residencia en El Invernadero: ${artista}.`,
      `Proyecto: '${titulo}'.`,
      `${programa}.`,
      "Pronto más sobre esta residencia.",
    ];
    return { principal, corta, cta, hashtags, stories };
  }

  // escuela
  const titulo = tc(valores.titulo) || "esta disciplina";
  const fechas = tc(valores.dato1) || tc(valores.rango) || "";
  const horario = tc(valores.dato2) || "";
  const precio = tc(valores.dato3) || "";
  const subtit = (valores.subtitulo || "").trim();
  const principal =
    `Este verano seguimos entrenando en El Invernadero.` +
    `\n${titulo} forma parte de Escuela · Verano` +
    (fechas ? `, con sesiones los días ${fechas}` : "") +
    (horario ? `, en horario de ${horario}` : "") + "." +
    (precio ? `\nPrecio: ${precio}.` : "") +
    (subtit ? `\n${subtit}` : "") +
    `\nInscripciones abiertas.`;
  const corta = `${titulo} · Escuela · Verano${fechas ? ` (${fechas})` : ""}. Inscripciones abiertas.`;
  const cta = "Reserva tu plaza.";
  const stories = [
    `Escuela · Verano: ${titulo}.`,
    [fechas, horario].filter(Boolean).join(" · ") || "Próximas sesiones.",
    precio ? `Precio: ${precio}.` : "Plazas limitadas.",
    "Inscripciones abiertas.",
  ];
  return { principal, corta, cta, hashtags, stories };
}

const outputSchema = z.object({
  principal: z.string(),
  corta: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()).length(5),
  stories: z.array(z.string()).min(3).max(4),
});

export const generateCopy = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { result: localFallback(data.familia, data.valores), source: "local" as const };
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
        ? `\nEjemplos REALES de captions de su Instagram (referencia de tono/ritmo/vocabulario — NO copiar):\n"""\n${data.referencias!.trim().slice(0, 3000)}\n"""\n`
        : "";

      const prompt = `${BRAND_VOICE}

${familyBlock(data.familia)}
${refsBlock}
Plantilla: ${data.plantilla}
Datos del posteo (las mayúsculas son sólo del arte, normalizá al escribir): ${JSON.stringify(data.valores)}

FORMATO DE SALIDA (obligatorio):
- principal: copy principal entre 500 y 900 caracteres. Priorizar datos reales. No genérico. No inventar.
- corta: versión corta entre 180 y 300 caracteres (recordatorio o reel).
- cta: una sola línea, directa.
- hashtags: EXACTAMENTE 5, los indicados para esta familia (en ese orden). Nada dentro del cuerpo.
- stories: 3 o 4 micro-frases para stories. Orden: (1) qué pasa, (2) dato clave (fecha/horario/público), (3) precio/entrada/inscripción, (4) CTA final.

Mejor simple y correcto que creativo y falso.`;

      const { object } = await generateObject({
        model: provider("google/gemini-3-flash-preview"),
        schema: outputSchema,
        prompt,
      });
      // Asegurar hashtags correctos por familia (forzar consistencia)
      const result: CopyResult = { ...object, hashtags: defaultHashtags(data.familia) };
      return { result, source: "ai" as const };
    } catch (e) {
      console.error("AI copy failed", e);
      return { result: localFallback(data.familia, data.valores), source: "local" as const };
    }
  });
