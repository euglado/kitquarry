import assert from "node:assert/strict";
import test from "node:test";
import { plan } from "../src/planner.js";
import { Store, TTL } from "../src/store.js";

const binding = { owner: "alice", guild: "guild", channel: "channel" };
const p = plan({ title: "Workshop", kits: "2", spares: "0", materials: "A|1|1\nB|1|1" });
test("draft is bound to owner guild and channel", () => {
  const s = new Store();
  const id = s.create(binding, "en");
  assert.ok(id);
  for (const field of ["owner", "guild", "channel"] as const)
    assert.equal(s.get(id, { ...binding, [field]: "other" }), undefined);
  assert.ok(s.get(id, binding));
});
test("preview and consumption require correct stage and source message", () => {
  const s = new Store();
  const id = s.create(binding, "en");
  assert.ok(id);
  assert.equal(s.take(id, binding, "message"), undefined);
  assert.equal(s.preview(id, binding, p, "message"), true);
  assert.equal(s.preview(id, binding, p, "second"), false);
  assert.equal(s.take(id, binding, "wrong"), undefined);
  assert.equal(s.take(id, binding, "message")?.stage, "preview");
  assert.equal(s.take(id, binding, "message"), undefined);
});
test("draft expires at exactly five minutes including form filling", () => {
  let now = 0;
  const s = new Store(() => now);
  const id = s.create(binding, "tr");
  assert.ok(id);
  now = TTL - 1;
  assert.equal(s.preview(id, binding, p, "m"), true);
  now = TTL;
  assert.equal(s.take(id, binding, "m"), undefined);
  assert.equal(s.drafts.size, 0);
});
test("form cooldown expires at five seconds and replaces old draft", () => {
  let now = 0;
  const s = new Store(() => now);
  const first = s.create(binding, "en");
  assert.ok(first);
  now = 4999;
  assert.equal(s.create(binding, "en"), undefined);
  now = 5000;
  const second = s.create(binding, "en");
  assert.ok(second);
  assert.notEqual(first, second);
  assert.equal(s.get(first, binding), undefined);
  assert.equal(s.drafts.size, 1);
});
test("channel reservation applies across members and lasts sixty seconds", () => {
  let now = 0;
  const s = new Store(() => now);
  assert.equal(s.reserve("c"), true);
  assert.equal(s.reserve("c"), false);
  assert.equal(s.reserve("other"), true);
  now = 59999;
  assert.equal(s.reserve("c"), false);
  now = 60000;
  assert.equal(s.reserve("c"), true);
});
test("bounded draft capacity recovers after expiry", () => {
  let now = 0;
  const s = new Store(() => now);
  for (let n = 0; n < 100; n++) assert.ok(s.create({ ...binding, owner: String(n) }, "en"));
  assert.equal(s.create({ ...binding, owner: "overflow" }, "en"), undefined);
  now = TTL;
  assert.ok(s.create({ ...binding, owner: "new" }, "en"));
  assert.equal(s.drafts.size, 1);
});
test("cooldown maps have a hard capacity", () => {
  const s = new Store(() => 0);
  for (let n = 0; n < 1000; n++) assert.equal(s.reserve(String(n)), true);
  assert.equal(s.reserve("overflow"), false);
});
