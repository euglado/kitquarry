import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
assert.equal(lock.lockfileVersion, 3);
const licenses = new Set([
  "MIT",
  "MIT OR Apache-2.0",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
]);
let dependencies = 0;
for (const [name, pkg] of Object.entries(lock.packages)) {
  if (!name) continue;
  assert.match(
    pkg.resolved,
    /^https:\/\/registry\.npmjs\.org\//,
    `Unapproved dependency source: ${name}`,
  );
  assert.match(pkg.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/, `Missing strong integrity: ${name}`);
  assert.ok(licenses.has(pkg.license), `Review dependency license: ${name}`);
  assert.ok(!pkg.hasInstallScript, `Review install script: ${name}`);
  dependencies++;
}
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bmfa\.[\w-]{60,}\b/,
  /\b[A-Za-z0-9_-]{23,30}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,}\b/,
];
let sources = 0;
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "coverage"].includes(entry.name)) continue;
    assert.ok(!entry.isSymbolicLink(), "Review symbolic links before publishing");
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(file);
      continue;
    }
    const name = relative(root, file);
    assert.ok(
      !/^\.env(?:\.|$)/.test(entry.name) || entry.name === ".env.example",
      `Private config in source: ${name}`,
    );
    assert.ok(!/\.(?:pem|key|p12|pfx)$/i.test(name), `Private key container in source: ${name}`);
    const content = readFileSync(file, "utf8");
    assert.ok(!content.includes("\0"), `Review binary source: ${name}`);
    for (const pattern of patterns)
      assert.ok(!pattern.test(content), `Possible credential in ${name}; value omitted`);
    sources++;
  }
}
walk(root);
console.log(
  `Supply checks passed: ${dependencies} dependency license/registry/SHA-512/no-install-script records; ${sources} source credential-pattern scans.`,
);
console.log(
  "Pattern scans are not a complete secret detector. / Bu tarama tüm gizli değerleri tespit etmez.",
);
