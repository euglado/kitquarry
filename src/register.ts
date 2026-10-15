import { REST, Routes } from "discord.js";
import { config } from "./config.js";
import { command } from "./views.js";

async function main(): Promise<void> {
  const settings = config(process.env);
  const rest = new REST({ version: "10" }).setToken(settings.token);
  // POST upserts only this name; never replace/delete another command in the application.
  await rest.post(Routes.applicationGuildCommands(settings.applicationId, settings.guildId), {
    body: command.toJSON(),
  });
  console.log("/kitquarry registered in your server. / Komut sunucunuza kaydedildi.");
}
main().catch(() => {
  console.error(
    "Command registration failed. Run setup, check application/server IDs, invite and token privately. / Kurulumu, kimlikleri ve daveti kontrol edin.",
  );
  process.exitCode = 1;
});
