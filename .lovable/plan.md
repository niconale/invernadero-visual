## Objetivo
Reescribir solo el generador de copy (`src/lib/copy.functions.ts`) para que aplique la nueva GUÍA DE TONO de El Invernadero y devuelva un formato estructurado: copy principal, versión corta, CTA, 5 hashtags y 3–4 stories.

No se toca: Canvas, plantillas, colores, familias, export, navegación, store ni rutas. Solo el archivo del server function de copy y la UI mínima necesaria para mostrar el nuevo formato.

## Cambios

### 1. `src/lib/copy.functions.ts` (reescrito)
- Sustituir `BRAND_VOICE` por la guía completa (tono general, prohibidos, vocabulario válido, estructura por familia: Programación / Residencias / Escuela).
- Cambiar el esquema de salida de `{ copies: string[3] }` a:
  ```
  {
    principal: string,   // 500–900 chars
    corta: string,       // 180–300 chars
    cta: string,
    hashtags: string[5],
    stories: string[3..4]
  }
  ```
- Prompt por familia: incluir bloque específico (estructura recomendada + CTA recomendado + hashtags base de esa familia) seleccionado según `data.familia` (`programacion` | `residencias` | `escuela`).
- Reglas duras en el prompt: sin emojis por defecto, sin frases prohibidas, sin inventar datos, hashtags solo al final (no dentro del cuerpo), exactamente 5 hashtags, español neutro.
- Mantener uso de Lovable AI Gateway con `google/gemini-3-flash-preview` y `generateObject` + Zod.
- Fallback local (`localFallback`) reescrito para devolver la misma estructura nueva, con plantillas por familia siguiendo la guía (incluye Escuela).
- Mantener el parámetro `referencias` opcional (ejemplos reales de captions) para reforzar el tono.

### 2. `src/routes/index.tsx` (ajuste mínimo de UI de resultado)
- Adaptar el panel donde hoy se muestran las 3 variantes para renderizar el nuevo objeto: secciones "Copy principal", "Versión corta", "CTA", "Hashtags", "Stories" con botón copiar por bloque.
- Sin cambios de layout, estilos globales ni controles del editor.

## Lo que NO se toca
- `src/components/Canvas.tsx`
- `src/families/*` (programacion, residencias, escuela, types, index)
- `src/store/editor.ts`
- Export PNG/JPG
- Tabs / navegación / presets / máscaras / fuentes / colores

## Verificación visual al terminar
1. Generar copy en Programación → aparecen los 5 bloques (principal, corta, CTA, 5 hashtags, 3–4 stories) y se respeta fecha/hora/público.
2. Generar copy en Residencias → tono curatorial, menciona artista + proyecto + programa, sin frases prohibidas.
3. Generar copy en Escuela · Verano → menciona disciplina, fechas, horario, precio, "Inscripciones abiertas".
4. Hashtags: siempre 5, fuera del cuerpo, adaptados a la familia.
5. Sin emojis por defecto, sin "magia del circo", sin "experiencia única".
6. Canvas, plantillas y export siguen idénticos.
