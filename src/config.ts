export interface Config {
  token: string;
  applicationId: string;
  guildId: string;
}

export function config(env: NodeJS.ProcessEnv): Config {
  const token = env.DISCORD_TOKEN?.trim();
  const applicationId = env.APPLICATION_ID?.trim();
  const guildId = env.GUILD_ID?.trim();
  if (
    !token ||
    token === "replace_with_your_bot_token" ||
    /\s/.test(token) ||
    !applicationId ||
    !/^\d{17,20}$/.test(applicationId) ||
    !guildId ||
    !/^\d{17,20}$/.test(guildId)
  ) {
    throw new Error(
      "Run setup.cmd (Windows) or ./setup.sh (macOS/Linux) first. / Önce kurulumu çalıştırın.",
    );
  }
  return { token, applicationId, guildId };
}
