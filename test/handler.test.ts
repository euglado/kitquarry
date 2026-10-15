import assert from "node:assert/strict";
import test from "node:test";
import {
  ChannelType,
  type Interaction,
  MessageFlags,
  PermissionsBitField,
  type TextChannel,
} from "discord.js";
import { initialAccess, publishChannel } from "../src/access.js";
import { handler } from "../src/handler.js";
import { plan } from "../src/planner.js";
import { Store } from "../src/store.js";

const b = { owner: "alice", guild: "guild", channel: "channel" };
const p = plan({ title: "Workshop", kits: "24", spares: "2", materials: "Pencil|2|12\nCard|3|50" });
const full = new PermissionsBitField(PermissionsBitField.All);
type Payload = {
  nonce?: string;
  enforceNonce?: boolean;
  content?: string;
  flags?: number;
  components?: unknown[];
  allowedMentions?: { parse: unknown[] };
};
function fake(kind: "command" | "modal" | "button" = "button", customId = "") {
  const calls: { name: string; payload: Payload }[] = [];
  const value = {
    guildId: "guild",
    channelId: "channel",
    locale: "en",
    user: { id: "alice" },
    channel: { type: ChannelType.GuildText },
    memberPermissions: full,
    appPermissions: full,
    member: { communication_disabled_until: null },
    commandName: "kitquarry",
    customId,
    message: { id: "preview" },
    deferred: false,
    replied: false,
    options: { getString: () => null },
    fields: {
      getTextInputValue: (name: string) =>
        ({ title: "Workshop", kits: "24", spares: "2", materials: "Pencil|2|12\nCard|3|50" })[
          name as "title"
        ],
    },
    inGuild: () => true,
    isChatInputCommand: () => kind === "command",
    isModalSubmit: () => kind === "modal",
    isButton: () => kind === "button",
    reply: async (payload: Payload) => {
      value.replied = true;
      calls.push({ name: "reply", payload });
    },
    showModal: async () => {
      calls.push({ name: "modal", payload: {} });
    },
    fetchReply: async () => ({ id: "preview" }),
    deferUpdate: async () => {
      value.deferred = true;
      calls.push({ name: "defer", payload: {} });
    },
    editReply: async (payload: Payload) => {
      calls.push({ name: "edit", payload });
    },
  };
  return { value, calls, i: value as unknown as Interaction };
}
function ready(s: Store) {
  const id = s.create(b, "en");
  assert.ok(id);
  assert.equal(s.preview(id, b, p, "preview"), true);
  return id;
}
test("slash command opens modal without posting", async () => {
  const f = fake("command");
  const s = new Store();
  await handler("guild", s)(f.i);
  assert.deepEqual(
    f.calls.map((c) => c.name),
    ["modal"],
  );
  assert.equal(s.drafts.size, 1);
});
test("submitted form replies privately and binds preview message", async () => {
  const s = new Store();
  const id = s.create(b, "en");
  assert.ok(id);
  const f = fake("modal", `kq:form:${id}`);
  await handler("guild", s)(f.i);
  assert.equal(s.get(id, b)?.stage, "preview");
  assert.ok((f.calls[0]?.payload.flags ?? 0) & MessageFlags.Ephemeral);
  assert.deepEqual(f.calls[0]?.payload.allowedMentions?.parse, []);
  assert.equal(f.calls[0]?.payload.components?.length, 1);
});
test("invalid form remains private and gives useful error", async () => {
  const s = new Store();
  const id = s.create(b, "en");
  assert.ok(id);
  const f = fake("modal", `kq:form:${id}`);
  f.value.fields.getTextInputValue = () => "invalid";
  await handler("guild", s)(f.i);
  assert.match(f.calls[0]?.payload.content ?? "", /whole numbers/);
  assert.equal(s.get(id, b)?.stage, "form");
});
test("concurrent share defers and posts only once", async () => {
  const s = new Store();
  const id = ready(s);
  const sent: Payload[] = [];
  let authorized = 0;
  const channel = {
    send: async (payload: Payload) => {
      sent.push(payload);
    },
  } as unknown as TextChannel;
  const run = handler("guild", s, async () => {
    authorized++;
    return channel;
  });
  const first = fake("button", `kq:share:${id}`);
  const second = fake("button", `kq:share:${id}`);
  await Promise.all([run(first.i), run(second.i)]);
  assert.equal(sent.length, 1);
  assert.equal(authorized, 1);
  assert.equal(s.drafts.size, 0);
  assert.equal(first.calls[0]?.name, "defer");
  assert.deepEqual(sent[0]?.allowedMentions?.parse, []);
  assert.equal(sent[0]?.flags, MessageFlags.SuppressEmbeds);
  assert.equal(sent[0]?.nonce, id.slice(0, 24));
  assert.equal(sent[0]?.enforceNonce, true);
  assert.match(sent[0]?.content ?? "", /52 units/);
});
test("discard erases preview and never authorizes posting", async () => {
  const s = new Store();
  const id = ready(s);
  const f = fake("button", `kq:discard:${id}`);
  await handler("guild", s, async () => {
    assert.fail("must not authorize discard");
  })(f.i);
  assert.equal(s.drafts.size, 0);
  assert.match(f.calls.at(-1)?.payload.content ?? "", /Discarded/);
});
for (const field of ["owner", "guild", "channel", "message"] as const) {
  test(`wrong ${field} cannot use preview`, async () => {
    const s = new Store();
    const id = ready(s);
    const f = fake("button", `kq:share:${id}`);
    if (field === "owner") f.value.user.id = "other";
    if (field === "guild") f.value.guildId = "other";
    if (field === "channel") f.value.channelId = "other";
    if (field === "message") f.value.message.id = "other";
    await handler("guild", s, async () => {
      assert.fail("unauthorized preview");
    })(f.i);
    assert.equal(s.drafts.size, 1);
    assert.equal(f.calls[0]?.name, "reply");
  });
}
test("permission revocation consumes draft without posting", async () => {
  const s = new Store();
  const id = ready(s);
  const f = fake("button", `kq:share:${id}`);
  await handler("guild", s, async () => undefined)(f.i);
  assert.equal(s.drafts.size, 0);
  assert.match(f.calls.at(-1)?.payload.content ?? "", /Not shared/);
});
test("different member cannot bypass channel cooldown", async () => {
  const s = new Store();
  s.reserve("channel");
  const bob = { ...b, owner: "bob" };
  const id = s.create(bob, "en");
  assert.ok(id);
  s.preview(id, bob, p, "preview");
  const f = fake("button", `kq:share:${id}`);
  f.value.user.id = "bob";
  const channel = {
    send: async () => assert.fail("cooldown must block send"),
  } as unknown as TextChannel;
  await handler("guild", s, async () => channel)(f.i);
  assert.match(f.calls.at(-1)?.payload.content ?? "", /60 seconds/);
});
test("ambiguous send failure does not retry or restore draft", async () => {
  const s = new Store();
  const id = ready(s);
  const f = fake("button", `kq:share:${id}`);
  let sends = 0;
  const channel = {
    send: async () => {
      sends++;
      throw new Error("private test payload");
    },
  } as unknown as TextChannel;
  await handler("guild", s, async () => channel)(f.i);
  assert.equal(sends, 1);
  assert.equal(s.drafts.size, 0);
  assert.equal(s.reserve("channel"), false);
  assert.match(f.calls.at(-1)?.payload.content ?? "", /check the channel first/);
  assert.ok(!JSON.stringify(f.calls).includes("private test payload"));
});
for (const type of [
  ChannelType.DM,
  ChannelType.PublicThread,
  ChannelType.GuildAnnouncement,
  ChannelType.GuildForum,
]) {
  test(`deny unsupported channel type ${type}`, () => {
    const f = fake();
    f.value.channel.type = type;
    assert.equal(initialAccess(f.i, "guild"), false);
  });
}
test("deny missing user or bot permissions and timeout", () => {
  const f = fake();
  f.value.memberPermissions = new PermissionsBitField(0n);
  assert.equal(initialAccess(f.i, "guild"), false);
  f.value.memberPermissions = full;
  f.value.appPermissions = new PermissionsBitField(0n);
  assert.equal(initialAccess(f.i, "guild"), false);
  f.value.appPermissions = full;
  const timed = {
    ...f.value,
    member: { communication_disabled_until: new Date(Date.now() + 60000).toISOString() },
  } as unknown as Interaction;
  assert.equal(initialAccess(timed, "guild"), false);
});
function fresh(slowmode: number | null = 0) {
  const f = fake();
  const calls: string[] = [];
  const member = { isCommunicationDisabled: () => false };
  const channel = {
    type: ChannelType.GuildText,
    rateLimitPerUser: slowmode,
    permissionsFor: () => full,
  };
  const guild = {
    roles: {
      fetch: async () => {
        calls.push("roles");
      },
    },
    channels: {
      fetch: async () => {
        calls.push("channel");
        return channel;
      },
    },
    members: {
      fetch: async () => {
        calls.push("member");
        return member;
      },
    },
  };
  const i = { ...f.value, guild, client: { user: { id: "bot" } } } as unknown as Interaction;
  return { i, calls, channel, member };
}
for (const slowmode of [0, 60, null])
  test(`fresh access allows slowmode ${slowmode}`, async () => {
    const f = fresh(slowmode);
    assert.equal(await publishChannel(f.i, "guild"), f.channel);
    assert.deepEqual(f.calls, ["roles", "channel", "member", "member"]);
  });
test("fresh access rejects slowmode over sixty seconds", async () => {
  const f = fresh(61);
  assert.equal(await publishChannel(f.i, "guild"), undefined);
});
test("fresh access rejects new timeout", async () => {
  const f = fresh();
  f.member.isCommunicationDisabled = () => true;
  assert.equal(await publishChannel(f.i, "guild"), undefined);
});
test("fresh access rejects changed overwrites", async () => {
  const f = fresh();
  f.channel.permissionsFor = () => new PermissionsBitField(0n);
  assert.equal(await publishChannel(f.i, "guild"), undefined);
});
