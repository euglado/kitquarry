import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { config } from "./config.js";
import { handler } from "./handler.js";
import { Store } from "./store.js";

async function main(): Promise<void> {
  const settings = config(process.env);
  const store = new Store();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    rest: { retries: 0 },
    makeCache: Options.cacheWithLimits({
      MessageManager: 0,
      UserManager: 0,
      GuildMemberManager: 0,
    }),
    allowedMentions: { parse: [], repliedUser: false },
  });
  client.once(Events.ClientReady, () =>
    console.log("KitQuarry ready / hazır. Use /kitquarry in the configured server."),
  );
  client.on(Events.InteractionCreate, handler(settings.guildId, store));
  client.on(Events.Error, () =>
    console.error(
      "Discord connection error; details omitted. Check connection and token privately.",
    ),
  );
  const timer = setInterval(() => store.clean(), 30_000);
  timer.unref();
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clearInterval(timer);
      client.destroy();
    });
  await client.login(settings.token);
}
main().catch(() => {
  console.error(
    "KitQuarry could not start. Run setup.cmd or ./setup.sh; check token, Node 24 and network. / Kurulumu ve bağlantıyı kontrol edin.",
  );
  process.exitCode = 1;
});
