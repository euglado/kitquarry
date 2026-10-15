import { type Interaction, MessageFlags, type TextChannel } from "discord.js";
import { initialAccess, publishChannel } from "./access.js";
import { InputError, plan, render } from "./planner.js";
import { type Binding, Store } from "./store.js";
import { controls, language, modal, text } from "./views.js";

const privateFlags = MessageFlags.Ephemeral | MessageFlags.SuppressEmbeds;
const allowedMentions = { parse: [] as never[], repliedUser: false };
type Authorize = (interaction: Interaction, guildId: string) => Promise<TextChannel | undefined>;

export function handler(
  guildId: string,
  store = new Store(),
  authorize: Authorize = publishChannel,
) {
  return async (i: Interaction): Promise<void> => {
    if (!i.isChatInputCommand() && !i.isModalSubmit() && !i.isButton()) return;
    if (i.isChatInputCommand() ? i.commandName !== "kitquarry" : !i.customId.startsWith("kq:"))
      return;
    let lang = language(i.locale);
    const binding: Binding = {
      owner: i.user.id,
      guild: i.guildId ?? "",
      channel: i.channelId ?? "",
    };
    const reply = (content: string) => i.reply({ content, flags: privateFlags, allowedMentions });
    try {
      if (!initialAccess(i, guildId)) {
        await reply(
          text(
            lang,
            "Bu sunucuda normal bir metin kanalı kullanın. Sizde ve botta kanalı görme/gönderme izni, sizde komut izni olmalı; zaman aşımı aktif olmamalı.",
            "Use a regular text channel in the configured server. You and the bot need view/send permissions; you need command access and no active timeout.",
          ),
        );
        return;
      }
      if (i.isChatInputCommand()) {
        lang = language(i.locale, i.options.getString("language"));
        const id = store.create(binding, lang);
        if (!id) {
          await reply(
            text(
              lang,
              "5 saniye bekleyip yeniden deneyin; bot geçici olarak dolu da olabilir.",
              "Wait five seconds and try again; the bot may also be temporarily full.",
            ),
          );
          return;
        }
        await i.showModal(modal(id, lang));
        return;
      }
      const match = /^kq:(form|share|discard):([a-f0-9]{32})$/.exec(i.customId);
      const action = match?.[1];
      const id = match?.[2];
      const draft = id ? store.get(id, binding) : undefined;
      if (!id || !draft) {
        await reply(
          text(
            lang,
            "Bu taslak süresi dolmuş veya size ait değil. /kitquarry ile yeniden başlayın.",
            "This draft expired or belongs to someone else. Start again with /kitquarry.",
          ),
        );
        return;
      }
      lang = draft.lang;
      if (i.isModalSubmit() && action === "form" && draft.stage === "form") {
        const value = plan({
          title: i.fields.getTextInputValue("title"),
          kits: i.fields.getTextInputValue("kits"),
          spares: i.fields.getTextInputValue("spares"),
          materials: i.fields.getTextInputValue("materials"),
        });
        // Claim the form synchronously to stop duplicate submissions before awaiting Discord.
        if (!store.preview(id, binding, value, "pending")) return;
        await i.reply({
          content: `${render(value, lang)}\n\n${text(lang, "Özel önizleme. Paylaş derseniz bu kanaldaki herkes görür. Formu açtıktan 5 dakika sonra sona erer.", "Private preview. Share makes this visible to this channel. Expires five minutes after opening the form.")}`,
          flags: privateFlags,
          allowedMentions,
          components: controls(id, lang),
        });
        const message = await i.fetchReply();
        const current = store.get(id, binding);
        if (current?.stage === "preview") current.message = message.id;
        return;
      }
      if (
        i.isButton() &&
        (action === "share" || action === "discard") &&
        draft.stage === "preview"
      ) {
        const value = store.take(id, binding, i.message.id);
        if (value?.stage !== "preview") {
          await reply(
            text(
              lang,
              "Önizleme hazır değil veya zaten kullanıldı. Yeniden başlayın.",
              "Preview is not ready or was already used. Start again.",
            ),
          );
          return;
        }
        await i.deferUpdate();
        await i.editReply({
          content: text(
            lang,
            "Taslak kapatıldı; işlem kontrol ediliyor.",
            "Draft closed; checking the action.",
          ),
          components: [],
        });
        if (action === "discard") {
          await i.editReply({
            content: text(
              lang,
              "Vazgeçildi. Taslak bellekten silindi.",
              "Discarded. Draft removed from memory.",
            ),
          });
          return;
        }
        const channel = await authorize(i, guildId);
        if (!channel) {
          await i.editReply({
            content: text(
              lang,
              "Paylaşılmadı. Güncel izinleri, zaman aşımını ve kanal yavaş modunu (en fazla 60 saniye) kontrol edin.",
              "Not shared. Check current permissions, timeout and channel slowmode (at most 60 seconds).",
            ),
          });
          return;
        }
        if (!store.reserve(binding.channel)) {
          await i.editReply({
            content: text(
              lang,
              "Bu kanalda paylaşım için 60 saniye bekleyip yeni taslak açın.",
              "Wait 60 seconds before sharing another plan in this channel; open a new draft.",
            ),
          });
          return;
        }
        await channel.send({
          content: render(value.plan, lang),
          nonce: id.slice(0, 24),
          enforceNonce: true,
          flags: MessageFlags.SuppressEmbeds,
          allowedMentions,
        });
        await i.editReply({
          content: text(
            lang,
            "Plan bu kanalda paylaşıldı. Taslak bellekten silindi.",
            "Plan shared in this channel. Draft removed from memory.",
          ),
        });
        return;
      }
      await reply(
        text(
          lang,
          "Bu işlem artık geçerli değil. Yeniden başlayın.",
          "This action is no longer valid. Start again.",
        ),
      );
    } catch (error) {
      if (!(error instanceof InputError))
        console.error("Interaction could not complete; private details omitted.");
      const content =
        error instanceof InputError
          ? text(lang, error.tr, error.en)
          : text(
              lang,
              "İşlem tamamlanamadı. Paylaşmayı denediyseniz önce kanalı kontrol edin; otomatik tekrar yapılmadı. /kitquarry ile yeniden başlayın.",
              "Could not complete the action. If you tried sharing, check the channel first; no automatic retry was made. Start again with /kitquarry.",
            );
      try {
        if (i.deferred || i.replied) await i.editReply({ content, components: [] });
        else await reply(content);
      } catch {
        /* Expired interaction: never print payloads, tokens or user input. */
      }
    }
  };
}
