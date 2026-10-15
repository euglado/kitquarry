import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../../", import.meta.url));
for (const target of ["dist/src/main.js", "dist/src/register.js", "scripts/setup.mjs"]) {
  test(`unconfigured ${target} safely exits without writes`, () => {
    const temp = mkdtempSync(join(tmpdir(), "kitquarry-test-"));
    assert.equal(dirname(resolve(temp)), resolve(tmpdir()));
    assert.ok(basename(temp).startsWith("kitquarry-test-"));
    const env = { ...process.env };
    delete env.DISCORD_TOKEN;
    delete env.APPLICATION_ID;
    delete env.GUILD_ID;
    try {
      assert.ok(existsSync(join(repo, target)), "Test must execute the real entry point");
      const result = spawnSync(process.execPath, [join(repo, target)], {
        cwd: temp,
        env,
        encoding: "utf8",
        timeout: 10000,
      });
      assert.equal(result.status, 1);
      assert.ok(!result.error);
      assert.equal(existsSync(join(temp, ".env")), false);
      assert.match(result.stderr, /setup|Setup|interactive/);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
}
