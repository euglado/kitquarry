import assert from "node:assert/strict";
import test from "node:test";
import { config } from "../src/config.js";
import { InputError, integer, label, plan, render } from "../src/planner.js";
import { command, controls, language, modal } from "../src/views.js";

const input = {
  title: "Craft day",
  kits: "24",
  spares: "2",
  materials: "Pencil | 2 | 12\nCard | 3 | 50",
};
test("round each material up independently and count leftovers", () => {
  const p = plan(input);
  assert.equal(p.total, 26);
  assert.deepEqual(
    p.materials.map((m) => [m.units, m.packs, m.leftover]),
    [
      [52, 5, 8],
      [78, 2, 22],
    ],
  );
});
test("exact divisibility buys no extra pack", () => {
  const p = plan({ ...input, kits: "12", spares: "0" });
  assert.equal(p.materials[0]?.packs, 2);
  assert.equal(p.materials[0]?.leftover, 0);
});
test("quantity boundary remains integer and bounded", () => {
  const p = plan({ ...input, kits: "500", spares: "100", materials: "A | 1000 | 1\nB | 1 | 1000" });
  assert.deepEqual(
    p.materials.map((m) => [m.units, m.packs, m.leftover]),
    [
      [600000, 600000, 0],
      [600, 1, 400],
    ],
  );
});
test("integer rounding invariants across pack sizes", () => {
  for (let total = 1; total <= 600; total += 17)
    for (let size = 1; size <= 1000; size += 31) {
      const p = plan({
        ...input,
        kits: String(Math.min(500, total)),
        spares: String(Math.max(0, total - 500)),
        materials: `A | 7 | ${size}\nB | 1 | 1`,
      });
      const m = p.materials[0];
      assert.ok(m);
      assert.ok(m.packs * size >= m.units);
      assert.ok((m.packs - 1) * size < m.units);
      assert.ok(m.leftover >= 0 && m.leftover < size);
    }
});
for (const value of [
  "-1",
  "1.5",
  "1e2",
  "+2",
  "",
  "1,000",
  "Infinity",
  "NaN",
  "１２",
  "1\n2",
  "100000",
]) {
  test(`reject non-whole numeric input ${JSON.stringify(value)}`, () =>
    assert.throws(() => integer(value, 0, 1000), InputError));
}
for (const [field, value] of [
  ["kits", "0"],
  ["kits", "501"],
  ["spares", "101"],
  ["spares", "-1"],
]) {
  test(`reject out-of-range ${field} ${value}`, () =>
    assert.throws(() => plan({ ...input, [field ?? ""]: value }), InputError));
}
for (const materials of [
  "Only | 1 | 1",
  "",
  "A|1\nB|1|1",
  "A|1|1|extra\nB|1|1",
  "A|0|1\nB|1|1",
  "A|1|0\nB|1|1",
  "A|1001|1\nB|1|1",
  "A|1|1001\nB|1|1",
  "A|1|1\n\nB|1|1",
  "A|1|1\na|2|3",
  Array.from({ length: 9 }, (_, i) => `Name ${i}|1|1`).join("\n"),
]) {
  test(`reject malformed materials ${JSON.stringify(materials).slice(0, 60)}`, () =>
    assert.throws(() => plan({ ...input, materials }), InputError));
}
for (const value of [
  "@everyone",
  "<@123>",
  "https://example.com",
  "**bold**",
  "A\u202eB",
  "A\u200bB",
  "A\nB",
  "`code`",
  "a".repeat(61),
]) {
  test(`reject unsafe label ${JSON.stringify(value)}`, () =>
    assert.throws(() => label(value, 60), InputError));
}
test("Turkish names and Windows newlines work", () => {
  const p = plan({ ...input, title: "Öğrenme günü", materials: "Kağıt | 2 | 12\r\nFırça | 1 | 3" });
  assert.equal(p.materials[0]?.name, "Kağıt");
  assert.match(render(p, "tr"), /yedek/);
  assert.match(render(p, "en"), /spare/);
});
test("maximum public and private result fit the Discord 2000-character limit", () => {
  const p = plan({
    ...input,
    title: "A".repeat(60),
    kits: "500",
    spares: "100",
    materials: Array.from({ length: 8 }, (_, i) => `${"X".repeat(38)} ${i}|1000|999`).join("\n"),
  });
  for (const lang of ["tr", "en"] as const) assert.ok(render(p, lang).length + 250 < 2000);
});
test("locale defaults and explicit language", () => {
  assert.equal(language("tr"), "tr");
  assert.equal(language("de"), "en");
  assert.equal(language("tr", "en"), "en");
});
test("guild-only command with no required management permission", () => {
  const c = command.toJSON();
  assert.deepEqual(c.contexts, [0]);
  assert.deepEqual(c.integration_types, [0]);
  assert.equal(c.default_member_permissions, undefined);
});
test("modal uses current Label wrappers and bounded text inputs", () => {
  const value = modal("a".repeat(32), "tr").toJSON();
  assert.equal(value.components.length, 4);
  assert.ok(value.components.every((c) => c.type === 18));
  assert.ok(JSON.stringify(value).includes("500"));
  assert.equal(controls("b".repeat(32), "en")[0]?.toJSON().components.length, 2);
});
test("config accepts validated IDs but does not expose token in errors", () => {
  const env = {
    DISCORD_TOKEN: "example-only",
    APPLICATION_ID: "12345678901234567",
    GUILD_ID: "22345678901234567",
  };
  assert.equal(config(env).guildId, env.GUILD_ID);
  assert.throws(() => config({ ...env, GUILD_ID: "bad" }), /Run setup/);
  assert.throws(() => config({}), /Run setup/);
  assert.throws(() => config({ ...env, DISCORD_TOKEN: "has spaces" }), /Run setup/);
});
