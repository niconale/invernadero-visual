import type { FamilyDefinition, LayoutPreset } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "Foto + bloque abajo izq.", block: "abajo-izq", variant: "foto", accent: "estandar" },
  { id: "B", label: "Foto + bloque abajo centro", block: "abajo-centro", variant: "foto", accent: "barra-lateral" },
  { id: "C", label: "Color sólido + foto chica", block: "abajo-izq", variant: "color-foto", accent: "marco" },
];

export const programacion: FamilyDefinition = {
  id: "programacion",
  label: "Programación",
  color: "#B5451E",
  colorDark: "#7E2F12",
  textOnColor: "#F3EDE0",
  templates: [
    {
      id: "cartel",
      label: "Cartel principal",
      description: "Anuncio principal de una función.",
      requiresPhoto: true,
      fields: [
        { id: "titulo", label: "Título de la obra", type: "text", maxLength: 40, required: true, placeholder: "PIES SOBRE LA TIERRA" },
        { id: "compania", label: "Compañía / artista", type: "text", maxLength: 50, placeholder: "Cía. X" },
        { id: "fecha", label: "Fecha", type: "text", maxLength: 30, required: true, placeholder: "Sábado 14 de junio" },
        { id: "hora", label: "Hora", type: "text", maxLength: 12, placeholder: "21:00" },
        { id: "lugar", label: "Lugar", type: "text", maxLength: 40, placeholder: "El Invernadero Circo" },
        { id: "cta", label: "CTA / entradas", type: "text", maxLength: 60, required: true, placeholder: "Entradas en linktr.ee/invernadero" },
      ],
      presets: PRESETS,
    },
    {
      id: "teaser",
      label: "Teaser / próximamente",
      description: "Aviso anticipado, sin fecha precisa.",
      requiresPhoto: true,
      fields: [
        { id: "titulo", label: "Título", type: "text", maxLength: 40, required: true, placeholder: "PRÓXIMAMENTE" },
        { id: "subtitulo", label: "Subtítulo", type: "text", maxLength: 60, placeholder: "Una nueva obra de…" },
        { id: "fecha", label: "Mes / período", type: "text", maxLength: 30, placeholder: "Junio 2026" },
        { id: "cta", label: "CTA", type: "text", maxLength: 60, required: true, placeholder: "Más info pronto" },
      ],
      presets: PRESETS,
    },
    {
      id: "ultima",
      label: "Última función",
      description: "Urgencia: última oportunidad.",
      requiresPhoto: true,
      fields: [
        { id: "titulo", label: "Título de la obra", type: "text", maxLength: 40, required: true },
        { id: "fecha", label: "Fecha última función", type: "text", maxLength: 30, required: true, placeholder: "Domingo 22, 20:00" },
        { id: "cta", label: "CTA", type: "text", maxLength: 60, required: true, placeholder: "Últimas entradas" },
      ],
      presets: PRESETS,
    },
    {
      id: "entradas",
      label: "Entradas a la venta",
      description: "Apertura de venta.",
      requiresPhoto: true,
      fields: [
        { id: "titulo", label: "Título", type: "text", maxLength: 40, required: true, placeholder: "ENTRADAS A LA VENTA" },
        { id: "obra", label: "Obra", type: "text", maxLength: 40, placeholder: "Pies sobre la tierra" },
        { id: "fecha", label: "Funciones", type: "text", maxLength: 40, required: true },
        { id: "cta", label: "Link", type: "text", maxLength: 60, required: true, placeholder: "linktr.ee/invernadero" },
      ],
      presets: PRESETS,
    },
  ],
};
