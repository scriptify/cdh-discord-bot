import Discord from "discord.js";

const TEAM_ROLE_ID = "897144824942170153";

export function isSenderAdmin(msg: Discord.Message) {
  return msg.member?.roles.cache.has(TEAM_ROLE_ID) ?? false;
}

export type DiscordBotCommand = (msg: Discord.Message) => Promise<any>;
