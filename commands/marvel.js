const { SlashCommandBuilder } = require("discord.js");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
// const URL = "https://gateway.marvel.com:443/v1/public/characters";
const URL =
  "https://umayadia-apisample.azurewebsites.net/api/persons/Shakespeare";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("marvel")
    .setDescription("Random Marvel character!"),
  async execute(interaction) {
    // get from marvel api
    const response = await fetch(URL);
    const data = await response.json();
    console.log(data);
    await interaction.reply({
      content: `your marvel character is ${data.data.name}`,
      ephemeral: true,
      files: ["https://placehold.jp/3d4070/ffffff/150x150.png"],
    });
  },
};
