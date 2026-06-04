import { programacion } from "./programacion";
import { residencias } from "./residencias";
import type { FamilyDefinition } from "./types";

export const FAMILIES: FamilyDefinition[] = [programacion, residencias];

export function getFamily(id: string): FamilyDefinition {
  const f = FAMILIES.find((x) => x.id === id);
  if (!f) throw new Error(`Familia desconocida: ${id}`);
  return f;
}

export function getTemplate(familyId: string, templateId: string) {
  const fam = getFamily(familyId);
  const tpl = fam.templates.find((t) => t.id === templateId);
  if (!tpl) throw new Error(`Plantilla desconocida: ${templateId}`);
  return tpl;
}
