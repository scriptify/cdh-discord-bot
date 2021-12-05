import Discord from "discord.js";

import { DiscordBotCommand, isSenderAdmin } from "../util";

const PRUNE_CMD = "!prune";
const PRUNE_INFO_CMD = "!prune_info";

const NEEDED_ROLE_ID = "897890510868463617";

async function getMembersToPrune(msg: Discord.Message) {
  const members = await msg.guild?.members.fetch();
  if (!members) return null;
  const membersToPrune = members.filter((member) => {
    return !member.roles.cache.has(NEEDED_ROLE_ID) && !member.user.bot;
  });
  msg.reply(`
    🦵 The following members will be pruned (${membersToPrune.size}):

    ${membersToPrune
      .map((member) => member.displayName)
      .slice(0, 20)
      .join("\n")}
    ${membersToPrune.size > 20 ? "\n..." : ""}
  `);

  return membersToPrune;
}

export const pruneCommand: DiscordBotCommand = async (msg) => {
  if (!isSenderAdmin(msg)) return;

  if (msg.content === PRUNE_INFO_CMD) {
    await getMembersToPrune(msg);
    return;
  }
  if (msg.content.startsWith(PRUNE_CMD)) {
    const membersToPrune = await getMembersToPrune(msg);
    if (!membersToPrune) return;

    if (membersToPrune.size > 10 && msg.content !== "!prune_force") {
      await msg.reply(
        `
          🦵 More then 10 members will be pruned. You need to execute
          !prune_force
          `
      );
      return;
    }
    for (const [, member] of membersToPrune) {
      await member.kick();
    }
    msg.reply(`✅ Successfully pruned ${membersToPrune.size} members`);
    return;
  }
};
