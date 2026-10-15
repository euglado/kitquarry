import { randomBytes } from "node:crypto";
import type { Language, Plan } from "./planner.js";

export const TTL = 5 * 60_000;
export interface Binding {
  owner: string;
  guild: string;
  channel: string;
}
interface Base extends Binding {
  expires: number;
  lang: Language;
}
export type Draft = Base & ({ stage: "form" } | { stage: "preview"; plan: Plan; message: string });

export class Store {
  readonly drafts = new Map<string, Draft>();
  readonly forms = new Map<string, number>();
  readonly shares = new Map<string, number>();
  constructor(private readonly now: () => number = Date.now) {}
  clean(): void {
    const now = this.now();
    for (const [key, value] of this.drafts) if (value.expires <= now) this.drafts.delete(key);
    for (const map of [this.forms, this.shares])
      for (const [key, expiry] of map) if (expiry <= now) map.delete(key);
  }
  create(binding: Binding, lang: Language): string | undefined {
    this.clean();
    if (this.drafts.size >= 100 || this.forms.has(binding.owner) || this.forms.size >= 1000)
      return undefined;
    // One draft per member: replacing it also removes the previous input from RAM.
    for (const [key, value] of this.drafts)
      if (value.owner === binding.owner) this.drafts.delete(key);
    const id = randomBytes(16).toString("hex");
    this.drafts.set(id, { ...binding, lang, stage: "form", expires: this.now() + TTL });
    this.forms.set(binding.owner, this.now() + 5000);
    return id;
  }
  get(id: string, binding: Binding): Draft | undefined {
    this.clean();
    const value = this.drafts.get(id);
    return value &&
      value.owner === binding.owner &&
      value.guild === binding.guild &&
      value.channel === binding.channel
      ? value
      : undefined;
  }
  preview(id: string, binding: Binding, plan: Plan, message: string): boolean {
    const value = this.get(id, binding);
    if (value?.stage !== "form") return false;
    this.drafts.set(id, { ...value, stage: "preview", plan, message });
    return true;
  }
  take(id: string, binding: Binding, message: string): Draft | undefined {
    const value = this.get(id, binding);
    if (value?.stage !== "preview" || value.message !== message) return undefined;
    this.drafts.delete(id);
    return value;
  }
  reserve(channel: string): boolean {
    this.clean();
    if (this.shares.has(channel) || this.shares.size >= 1000) return false;
    this.shares.set(channel, this.now() + 60_000);
    return true;
  }
}
