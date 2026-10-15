import { ChannelType, type Interaction, PermissionFlagsBits, type TextChannel } from "discord.js";

const memberBits = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.UseApplicationCommands,
];
const botBits = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages];

export function initialAccess(interaction: Interaction, guildId: string): boolean {
  if (
    !interaction.inGuild() ||
    interaction.guildId !== guildId ||
    interaction.channel?.type !== ChannelType.GuildText
  )
    return false;
  if (!interaction.memberPermissions?.has(memberBits) || !interaction.appPermissions?.has(botBits))
    return false;
  const member = interaction.member;
  const until =
    member && "communicationDisabledUntilTimestamp" in member
      ? member.communicationDisabledUntilTimestamp
      : member && "communication_disabled_until" in member && member.communication_disabled_until
        ? Date.parse(member.communication_disabled_until)
        : null;
  return !until || until <= Date.now();
}

export async function publishChannel(
  interaction: Interaction,
  guildId: string,
): Promise<TextChannel | undefined> {
  if (
    !initialAccess(interaction, guildId) ||
    !interaction.guild ||
    !interaction.channelId ||
    !interaction.client.user
  )
    return undefined;
  const guild = interaction.guild;
  // Refresh role definitions as well as membership and channel overwrites before posting.
  await guild.roles.fetch();
  const channel = await guild.channels.fetch(interaction.channelId, { force: true, cache: false });
  const member = await guild.members.fetch({
    user: interaction.user.id,
    force: true,
    cache: false,
  });
  const bot = await guild.members.fetch({
    user: interaction.client.user.id,
    force: true,
    cache: false,
  });
  if (!channel || channel.type !== ChannelType.GuildText || member.isCommunicationDisabled())
    return undefined;
  if (!channel.permissionsFor(member).has(memberBits) || !channel.permissionsFor(bot).has(botBits))
    return undefined;
  if ((channel.rateLimitPerUser ?? 0) > 60) return undefined;
  return channel;
}
