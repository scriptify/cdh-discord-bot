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
const INFO_CMD = "!bingo_info";
const WIN_CMD = "!bingo_win";
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

  if (msg.content === INFO_CMD) {
    if (!isSenderAdmin(msg)) return;
    const winningFields = currentRound?.fields.filter(
      (field) => field.isWinning
    );
    const allUsedIds = linksUsed.map((link) => link.fieldId);
    const winningLinksInUse = winningFields?.filter((field) =>
      allUsedIds.includes(field.id)
    );
    const numWinningLinks = `${winningLinksInUse?.length}/${winningFields?.length}`;
    const numLinksUsed = `${linksUsed.length}/${currentRound?.fields.length}`;
    msg.author.send(`
❓❓ Current Game Info:
🌐 Links in use: ${numLinksUsed}
🏆 Winning Links in use: ${numWinningLinks}
    `);
  }

  if (msg.content === JOIN_CMD) {
    if (!currentRound) {
      msg.reply(`
😢 There is currently no round ongoing.
      `);
      return;
    }

    const didAlreadyJoin = linksUsed.find(
      (link) => link.userId === msg.author.id
    );
    if (didAlreadyJoin) {
      const field = currentRound?.fields.find(
        (field) => field.id === didAlreadyJoin.fieldId
      );
      msg.author.send(`
☝ You already joined the current Bingo Round!
${field?.url}
      `);
      return;
    }

    const field = retrieveJoinUrl(msg, linksUsed, currentRound);
    if (!field) {
      msg.reply(`
😢 Sorry, there are no more join links available.
      `);
    }
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

  if (msg.content === WIN_CMD) {
    const playerLink = linksUsed.find((link) => link.userId === msg.author.id);
    const winningUserField = currentRound?.fields.find(
      (field) => playerLink?.fieldId === field.id && field.isWinning
    );
    if (!winningUserField) {
      msg.reply(`‼ Big NO NO! You did not win the game.`);
    } else {
      msg.reply(`
✅🍀🌠 WE HAVE A WINNER 🌠🍀✅      
Congratulations to **${msg.author.username}**

**${msg.author.username}, prove it with a screenshot by answering this message!**
`);
    }
  }
};
