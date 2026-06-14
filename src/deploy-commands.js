require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Test bot"),

  new SlashCommandBuilder()
    .setName("settimezone")
    .setDescription("Set your timezone")
    .addStringOption(option =>
      option.setName("timezone")
        .setDescription("Example: Africa/Tunis")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("mytimezone")
    .setDescription("Show your timezone"),

  new SlashCommandBuilder()
    .setName("events")
    .setDescription("List events")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Deploying slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Done.");
  } catch (err) {
    console.error(err);
  }
})();