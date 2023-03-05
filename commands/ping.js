const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with ddddddd!"),
  async execute(interaction) {
    await interaction.reply({
      content: "Secret Pong!",
      ephemeral: true,
      files: ["https://placehold.jp/3d4070/ffffff/150x150.png"],
    });
  },
};
