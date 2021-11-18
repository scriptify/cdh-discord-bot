import { DiscordBotCommand, isSenderAdmin } from "../util";
import {
  BingoRound,
  deleteBingoRound,
  getUsedLinks,
  retrieveBingoRound,
  retrieveJoinUrl,
  saveBingoRound,
  setFieldUsed,
  UsedLink,
} from "./util";

const INIT_CMD = "!bingo_init";
const STOP_CMD = "!bingo_stop";
const JOIN_CMD = "!bingo";

let currentRound: BingoRound | undefined;

let linksUsed: UsedLink[] = [];

async function init() {
  linksUsed = await getUsedLinks();
  currentRound = await retrieveBingoRound();
}

init();

export const bingoCommand: DiscordBotCommand = async (msg) => {
  if (msg.content.startsWith(INIT_CMD)) {
    if (!isSenderAdmin(msg)) return;
    linksUsed = [];
    currentRound = await saveBingoRound(msg);
    msg.reply(`
🦜🏴‍☠️ Ayyyyght!
🍀 The bingo round has been initialized. May the luck be with you! 🍀
!bingo
    `);
  }

  if (msg.content === STOP_CMD) {
    if (!isSenderAdmin(msg)) return;
    currentRound = undefined;
    linksUsed = [];
    await deleteBingoRound();
    msg.reply(`
🦜🏴‍☠️ Uuggh.
🍀 The bingo round has been cleared. 🍀
    `);
  }

  if (msg.content === JOIN_CMD) {
    if (!currentRound) {
      msg.reply(`
😢 There is currently no round ongoing.
      `);
      return;
    }

    const didAlreadyJoin = !!linksUsed.find(
      (link) => link.userId === msg.author.id
    );
    if (didAlreadyJoin) {
      msg.reply(`
☝ You already joined the current Bingo Round!
      `);
      return;
    }

    const field = retrieveJoinUrl(msg, linksUsed, currentRound);
    await setFieldUsed(field.id, msg.author.id, linksUsed);
    msg.author.send(`
🎲 Welcome to Hipster Bingo!
🌎 Join with your unique URL:
${field.url}

🍀 May the luck be with you. 🍀
    `);
    msg.channel.send(
      `⏩⏩ **${msg.author.username}** just joined Hipster Bingo!`
    );
  }
};
