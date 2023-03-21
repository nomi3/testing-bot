// commands/janken.js
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("janken")
    .setDescription("じゃんけんで対戦するコマンド")
    .addUserOption((option) =>
      option
        .setName("opponent")
        .setDescription("対戦相手のユーザーを選択")
        .setRequired(true)
    ),
  async execute(interaction) {
    const opponent = interaction.options.getUser("opponent");
    if (opponent.bot || opponent.id === interaction.user.id) {
      return interaction.reply(
        "対戦相手が無効です。ボットや自分自身を選ばないでください。"
      );
    }

    const jankenOptions = ["グー", "チョキ", "パー"];
    const player1Choice =
      jankenOptions[Math.floor(Math.random() * jankenOptions.length)];
    const player2Choice =
      jankenOptions[Math.floor(Math.random() * jankenOptions.length)];

    const resultMatrix = {
      グー: {
        グー: "引き分け",
        チョキ: "勝ち",
        パー: "負け",
      },
      チョキ: {
        グー: "負け",
        チョキ: "引き分け",
        パー: "勝ち",
      },
      パー: {
        グー: "勝ち",
        チョキ: "負け",
        パー: "引き分け",
      },
    };

    const result = resultMatrix[player1Choice][player2Choice];

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("じゃんけん結果")
      .addFields(
        {
          name: `${interaction.user.username} (${interaction.user.tag})`,
          value: `手: ${player1Choice}`,
          inline: true,
        },
        {
          name: `${opponent.username} (${opponent.tag})`,
          value: `手: ${player2Choice}`,
          inline: true,
        },
        {
          name: "結果",
          value: `${interaction.user.username} の ${result}!`,
        }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
