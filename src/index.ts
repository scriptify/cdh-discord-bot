import Discord from "discord.js";
import dotenv from "dotenv";
import { bingoCommand } from "./bingo";

const NUM_HIPSTERS = 10000;

dotenv.config();
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

const NEWBIE_MESSAGE = `
Welcome to the Hipsters! Grab a coffee and check:

<#897143953613279252>
<#905465109965574175>
<#897143870566055966>
<#902887724850249788>

If you got any questions don't bother to ask us!
`;

function main() {
  client.on("ready", () => {
    console.log(`Discord Bot started and waiting for commands!`);
  });

  client.on("messageCreate", (msg) => {
    bingoCommand(msg);

    if (msg.content.includes("#")) {
      const allOccurrences = [
        ...msg.content.matchAll(new RegExp(/#[0-9]\d*\b/, "gi")),
      ].map((oc) => oc.toString());

      const hipsterIndices = allOccurrences
        .map((indexStr) => {
          const parsed = parseInt(indexStr.replace("#", ""));
          if (isNaN(parsed)) {
            return null;
          }
          return parsed;
        })
        .filter((num) => num !== null && num < NUM_HIPSTERS);

      const linksToPost = hipsterIndices.map(
        (index) => `https://www.cardanohipsters.io/collection/${index}`
      );

      for (const link of linksToPost) {
        msg.reply(link);
      }
    }

    if (msg.content === "!new") {
      msg.reply(NEWBIE_MESSAGE);
    }
  });

  client.login(process.env.BOT_TOKEN);
}

main();
