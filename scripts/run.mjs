import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const action = process.argv[2];
if (
  Number(process.versions.node.split(".")[0]) !== 24 ||
  !["setup", "register", "start"].includes(action)
) {
  console.error(
    "Use Node.js 24 and setup/register/start helper. / Node.js 24 ve kurulum yardımcılarını kullanın.",
  );
  process.exit(1);
}
function npm(args) {
  // All arguments are fixed below, never sourced from form fields or token input.
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error || result.status !== 0) {
    console.error(
      "Step failed; check the preceding message. / Adım başarısız; önceki iletiyi kontrol edin.",
    );
    process.exit(result.status || 1);
  }
}
if (action === "setup") {
  if (existsSync(".env")) {
    console.error(
      ".env exists; move it privately before setup. / .env mevcut; önce güvenli yere taşıyın.",
    );
    process.exit(1);
  }
  npm(["ci", "--ignore-scripts"]);
  npm(["run", "build"]);
  npm(["run", "setup"]);
} else {
  if (!existsSync("dist/src/main.js")) {
    console.error("Run setup first. / Önce kurulumu çalıştırın.");
    process.exit(1);
  }
  npm(["run", action]);
}
