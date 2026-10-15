import { existsSync, writeFileSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

async function hiddenToken() {
  stdout.write("Bot token (hidden / gizli): ");
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error) => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          finish(new Error("Cancelled"));
          return;
        }
        if (char === "\r" || char === "\n") {
          finish();
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (char >= " " && value.length < 300) value += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) !== 24)
    throw new Error("Use Node.js 24 / Node.js 24 kullanın.");
  if (!stdin.isTTY || !stdout.isTTY)
    throw new Error(
      "Open setup in an interactive terminal / Kurulumu etkileşimli terminalde açın.",
    );
  if (existsSync(".env"))
    throw new Error(
      ".env already exists; move it privately before running setup again / .env mevcut; yeniden kurmadan önce güvenli yere taşıyın.",
    );
  const rl = createInterface({ input: stdin, output: stdout });
  let applicationId;
  let guildId;
  try {
    applicationId = (await rl.question("Application ID / Uygulama kimliği: ")).trim();
    guildId = (await rl.question("Server ID / Sunucu kimliği: ")).trim();
  } finally {
    rl.close();
  }
  if (!/^\d{17,20}$/.test(applicationId) || !/^\d{17,20}$/.test(guildId))
    throw new Error("IDs must be 17–20 digits / Kimlikler 17–20 basamak olmalı.");
  const token = (await hiddenToken()).trim();
  if (
    token.length < 20 ||
    !/^[A-Za-z0-9._-]+$/.test(token) ||
    token === "replace_with_your_bot_token"
  )
    throw new Error(
      "Invalid token format; copy from the Bot page privately / Token biçimini kontrol edin.",
    );
  writeFileSync(
    ".env",
    `DISCORD_TOKEN=${token}\nAPPLICATION_ID=${applicationId}\nGUILD_ID=${guildId}\n`,
    { flag: "wx", mode: 0o600 },
  );
  stdout.write("Saved privately to .env. / .env kaydedildi.\n");
  stdout.write(
    `Invite / Davet: https://discord.com/oauth2/authorize?client_id=${applicationId}&permissions=3072&integration_type=0&scope=bot%20applications.commands\n`,
  );
  stdout.write("Next: register.cmd / ./register.sh, then start.cmd / ./start.sh\n");
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
