const Discord = require("discord.js");
const dotenv = require("dotenv");

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
    if (msg.content === "test") {
      msg.reply(
        "https://ogster.vercel.app/og-test/QmSYstvjJG1V15fneLQpzbqyTQbwpTvY2whwvvZ2ZrMasA"
      );
    }
  });

  client.login(process.env.BOT_TOKEN);
}

main();
