import path from "path";
import fs from "fs";
import Discord from "discord.js";

import fetch from "cross-fetch";

function ranElem<T = any>(arr: T[]) {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}

export type UsedLink = {
  fieldId: string;
  userId: string;
};

export type BingoRound = {
  fields: BingoLink[];
};

export type BingoLink = {
  url: string;
  isWinning: boolean;
  id: string;
};

const BASE_DIR = path.join(__dirname, "temp");
const BINGO_ROUND_FILE = path.join(BASE_DIR, "bingo_round.json");
const USED_LINKS_FILE = path.join(BASE_DIR, "used_ids.json");

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR);
}

/**
 * Reads bingo round from
 * Discord attachment text file
 */
export async function saveBingoRound(msg: Discord.Message) {
  await deleteBingoRound();
  let fileContents = "";

  for (const [key, file] of msg.attachments) {
    if (file.contentType?.includes("text/plain")) {
      fileContents = await fetch(file.url).then((res) => res.text());
      break;
    }
  }

  await fs.promises.writeFile(BINGO_ROUND_FILE, fileContents);
  return JSON.parse(fileContents) as BingoRound;
}

export async function retrieveBingoRound() {
  try {
    const content = JSON.parse(
      (await fs.promises.readFile(BINGO_ROUND_FILE)).toString()
    );

    return content as BingoRound;
  } catch (e) {
    return undefined;
  }
}

export async function deleteBingoRound() {
  try {
    await fs.promises.unlink(BINGO_ROUND_FILE);
    await fs.promises.unlink(USED_LINKS_FILE);
  } catch (e) {
    console.log("Nothing to clear...", e);
  }
}

export async function getUsedLinks() {
  try {
    return JSON.parse(
      (await fs.promises.readFile(USED_LINKS_FILE)).toString()
    ) as UsedLink[];
  } catch (e) {
    return [];
  }
}

export async function setFieldUsed(
  id: string,
  userId: string,
  usedFields: UsedLink[]
) {
  usedFields.push({
    fieldId: id,
    userId,
  });
  await fs.promises.writeFile(USED_LINKS_FILE, JSON.stringify(usedFields));
}

export function retrieveJoinUrl(
  msg: Discord.Message,
  linksUsed: UsedLink[],
  round: BingoRound
) {
  const usedIds = linksUsed.map((link) => link.fieldId);
  const unusedFields = round.fields.filter(
    (field) => !usedIds.includes(field.id)
  );
  const chosenField = ranElem(unusedFields);
  return chosenField;
}
