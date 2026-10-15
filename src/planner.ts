export type Language = "tr" | "en";
export interface PlanInput {
  title: string;
  kits: string;
  spares: string;
  materials: string;
}
export interface Material {
  name: string;
  perKit: number;
  packSize: number;
  units: number;
  packs: number;
  leftover: number;
}
export interface Plan {
  title: string;
  kits: number;
  spares: number;
  total: number;
  materials: Material[];
}

export class InputError extends Error {
  constructor(
    public readonly tr: string,
    public readonly en: string,
  ) {
    super(en);
  }
}

function invalid(tr: string, en: string): never {
  throw new InputError(tr, en);
}

export function integer(value: string, min: number, max: number): number {
  if (!/^\d{1,5}$/.test(value.trim()))
    invalid(
      "Sayı alanlarına yalnızca tam sayı girin.",
      "Use whole numbers only in numeric fields.",
    );
  const result = Number(value.trim());
  if (result < min || result > max)
    invalid(`Sayı ${min}–${max} aralığında olmalı.`, `Number must be between ${min} and ${max}.`);
  return result;
}

export function label(raw: string, max: number): string {
  const value = raw.trim().normalize("NFC");
  // Plain labels only: disallow mentions, links, Markdown and invisible direction controls.
  if (!value || value.length > max || !/^[\p{L}\p{N} ()'’.,+-]+$/u.test(value)) {
    invalid(
      `Adlar 1–${max} karakter olmalı; harf, sayı ve basit noktalama kullanın.`,
      `Names must be 1–${max} characters; use letters, digits and simple punctuation.`,
    );
  }
  return value;
}

export function plan(input: PlanInput): Plan {
  const title = label(input.title, 60);
  const kits = integer(input.kits, 1, 500);
  const spares = integer(input.spares || "0", 0, 100);
  const total = kits + spares;
  const lines = input.materials.trim().split(/\r?\n/);
  if (lines.length < 2 || lines.length > 8)
    invalid("2–8 malzeme satırı girin.", "Enter 2–8 material lines.");
  const names = new Set<string>();
  const materials = lines.map((line) => {
    const parts = line.split("|");
    if (parts.length !== 3)
      invalid(
        "Her satır: ad | kit başına adet | paket içi adet",
        "Each line: name | units per kit | units per pack",
      );
    const name = label(parts[0] ?? "", 40);
    const key = name.toLocaleLowerCase("tr");
    if (names.has(key))
      invalid("Malzeme adları farklı olmalı.", "Material names must be distinct.");
    names.add(key);
    const perKit = integer(parts[1] ?? "", 1, 1000);
    const packSize = integer(parts[2] ?? "", 1, 1000);
    const units = total * perKit;
    const packs = Math.ceil(units / packSize);
    return { name, perKit, packSize, units, packs, leftover: packs * packSize - units };
  });
  return { title, kits, spares, total, materials };
}

export function render(value: Plan, lang: Language): string {
  const tr = lang === "tr";
  const lines = [
    `KitQuarry — ${value.title}`,
    tr
      ? `${value.kits} kit + ${value.spares} yedek = ${value.total} kit`
      : `${value.kits} kits + ${value.spares} spare = ${value.total} kits`,
    "",
    ...value.materials.map((m) =>
      tr
        ? `${m.name}: ${m.units} adet gerekli; ${m.packs} paket × ${m.packSize} adet; ${m.leftover} adet artar. (Kit başına ${m.perKit})`
        : `${m.name}: ${m.units} units needed; ${m.packs} packs × ${m.packSize} units; ${m.leftover} units left. (${m.perKit} per kit)`,
    ),
    "",
    tr
      ? "Her malzeme ayrı hesaplanır. Mevcut stok düşülmez; miktarları paylaşmadan önce kontrol edin."
      : "Each material is separate. Existing stock is not deducted; check quantities before sharing.",
  ];
  return lines.join("\n");
}
