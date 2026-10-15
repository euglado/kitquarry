import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  LabelBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type { Language } from "./planner.js";

export const command = new SlashCommandBuilder()
  .setName("kitquarry")
  .setDescription("Privately plan workshop kits and whole supply packs")
  .setDescriptionLocalizations({
    tr: "Atölye kitlerini ve tam malzeme paketlerini özel olarak hesapla",
  })
  .setContexts(InteractionContextType.Guild)
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
  .addStringOption((option) =>
    option
      .setName("language")
      .setDescription("Result language / Sonuç dili")
      .addChoices({ name: "Türkçe", value: "tr" }, { name: "English", value: "en" }),
  );

export function modal(id: string, lang: Language): ModalBuilder {
  const tr = lang === "tr";
  const fields = [
    {
      id: "title",
      label: tr ? "Atölye adı (1–60 karakter)" : "Workshop name (1–60 characters)",
      placeholder: tr ? "Hafta sonu el işi" : "Weekend craft workshop",
      max: 60,
    },
    {
      id: "kits",
      label: tr ? "Katılımcı kit sayısı (1–500)" : "Participant kits (1–500)",
      placeholder: "24",
      max: 3,
    },
    {
      id: "spares",
      label: tr ? "Ek yedek kit (0–100)" : "Additional spare kits (0–100)",
      placeholder: "2",
      max: 3,
    },
    {
      id: "materials",
      label: tr
        ? "2–8 satır: ad | kit adedi | paket adedi"
        : "2–8 lines: name | per kit | per pack",
      placeholder: tr ? "Kalem | 2 | 12\nKart | 3 | 50" : "Pencil | 2 | 12\nCard | 3 | 50",
      max: 500,
    },
  ];
  return new ModalBuilder()
    .setCustomId(`kq:form:${id}`)
    .setTitle(tr ? "KitQuarry malzeme planı" : "KitQuarry supply plan")
    .addLabelComponents(
      ...fields.map((field) =>
        new LabelBuilder().setLabel(field.label).setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setStyle(field.id === "materials" ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setPlaceholder(field.placeholder)
            .setMaxLength(field.max)
            .setMinLength(1)
            .setRequired(true),
        ),
      ),
    );
}

export function controls(id: string, lang: Language): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`kq:share:${id}`)
        .setLabel(lang === "tr" ? "Bu kanalda paylaş" : "Share in this channel")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`kq:discard:${id}`)
        .setLabel(lang === "tr" ? "Vazgeç" : "Discard")
        .setStyle(ButtonStyle.Secondary),
    ),
  ];
}

export function language(locale: string, option: string | null = null): Language {
  return option === "tr" || option === "en" ? option : locale.startsWith("tr") ? "tr" : "en";
}

export function text(lang: Language, tr: string, en: string): string {
  return lang === "tr" ? tr : en;
}
