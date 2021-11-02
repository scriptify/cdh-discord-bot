const Discord = require("discord.js");
const dotenv = require("dotenv");

const NUM_HIPSTERS = 10000;

dotenv.config();
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

function main() {
  client.on("ready", () => {
    console.log(`Discord Bot started and waiting for commands!`);
  });

  client.on("messageCreate", (msg) => {
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
  });

  client.login(process.env.BOT_TOKEN);
}

main();
