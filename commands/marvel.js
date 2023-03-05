const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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

    // const response = await fetch(url);
    // const data = await response.json();
    // const total = data.data.total;
    const total = 1562;
    const randomIndex = Math.floor(Math.random() * total);

    const characterResponse = await fetch(
      `${url}&limit=1&offset=${randomIndex}`
    );
    const characterData = await characterResponse.json();
    const randomCharacter = characterData.data.results[0];
    console.log(randomCharacter);
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(randomCharacter.name)
      .setDescription(randomCharacter.description);

    await interaction.reply({
      content: `your marvel character is ${randomCharacter.name}`,
      ephemeral: true,
      embeds: [embed],
      files: [
        randomCharacter.thumbnail.path +
          "." +
          randomCharacter.thumbnail.extension,
      ],
    });
  },
};
