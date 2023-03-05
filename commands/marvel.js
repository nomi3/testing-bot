const { SlashCommandBuilder } = require("discord.js");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const CryptoJS = require("crypto-js");
const BASE_URL = "https://gateway.marvel.com:443/v1/public/characters";
const PUBLIC_KEY = process.env.MARVEL_PUBLIC_KEY;
const PRIVATE_KEY = process.env.MARVEL_PRIVATE_KEY;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("marvel")
    .setDescription("Random Marvel character!"),
  async execute(interaction) {
    const ts = new Date().getTime();
    const hash = CryptoJS.MD5(ts + PRIVATE_KEY + PUBLIC_KEY).toString();
    const url = `${BASE_URL}?ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}`;

    const response = await fetch(url);
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * data.data.results.length);
    const randomCharacter = data.data.results[randomIndex];
    await interaction.reply({
      content: `your marvel character is ${randomCharacter.name}`,
      ephemeral: true,
      files: [
        randomCharacter.thumbnail.path +
          "." +
          randomCharacter.thumbnail.extension,
      ],
    });
  },
};
