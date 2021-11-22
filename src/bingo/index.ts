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
const START_CMD = "!bingo_start";
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

  if (msg.content === START_CMD) {
    if (!isSenderAdmin(msg)) return;
    if (!currentRound) {
      msg.reply(`You need to initialize a game first.`);
      return;
    }
    currentRound = {
      ...currentRound,
      state: "started",
    };
    msg.reply(`
🦜🏴‍☠️ Aiight.
🍀 The bingo round has been **started**. Users can now type !bingo_win 🍀
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
      msg.reply(`
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
    msg.reply(`
🎲 Welcome to Hipster Bingo!
🌎 Join with your unique URL:
${field.url}

🍀 May the luck be with you. 🍀
    `);
  }

  if (msg.content === WIN_CMD) {
    if (!currentRound || currentRound.state !== "started") {
      msg.reply(`
        🛑 The game did not start yet.
      `);
      return;
    }
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
