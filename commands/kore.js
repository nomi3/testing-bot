const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

// 定数定義
const ENERGY_LIMIT = 3; // エネルギーの上限値
const ENERGY_INC = 1; // 「溜める」を選択したときのエネルギー増加量
const ENERGY_DEC_ATK = 1; // 「攻撃」を選択したときのエネルギー減少量
const ENERGY_DEC_SUPER = 3; // 「超攻撃」を選択したときのエネルギー減少量
const TURN_TIME_LIMIT = 30000; // 1ターンあたりの制限時間（ミリ秒）

// プレイヤークラス
class Player {
  constructor(user) {
    this.user = user; // Discordユーザーオブジェクト
    this.energy = 0; // エネルギー
    this.action = null; // 選択したアクション（'charge', 'guard', 'attack', 'super'のいずれか）
    this.isReady = false; // 準備完了フラグ
    this.result = null; // 勝敗結果（'win', 'lose', 'draw'のいずれか）
  }

  // エネルギーの増加
  charge() {
    this.energy += ENERGY_INC;
    if (this.energy > ENERGY_LIMIT) {
      this.energy = ENERGY_LIMIT;
    }
  }

  // エネルギーの減少（通常攻撃）
  attack() {
    this.energy -= ENERGY_DEC_ATK;
    if (this.energy < 0) {
      this.energy = 0;
    }
  }

  // エネルギーの減少（超攻撃）
  super() {
    this.energy -= ENERGY_DEC_SUPER;
    if (this.energy < 0) {
      this.energy = 0;
    }
  }
}

// ゲームマネージャークラス
class GameManager {
  constructor(channel) {
    this.channel = channel; // 対戦チャンネル
    this.players = []; // プレイヤー配列
    this.timer = null; // タイマー
    this.turn = 1; // 現在のターン数
    this.isStarted = false; // 開始フラグ
    this.isFinished = false; // 終了フラグ
  }

  // プレイヤーの追加
  addPlayer(user) {
    if (this.players.length < 2) {
      const player = new Player(user);
      this.players.push(player);
      return true;
    }
    return false;
  }

  // ゲームの開始
  start() {
    if (this.players.length === 2) {
      // 両プレイヤーの準備完了フラグをリセット
      this.players[0].isReady = false;
      this.players[1].isReady = false;

      // タイマーを起動
      this.timer = setTimeout(() => {
        this.endTurn();
      }, TURN_TIME_LIMIT);

      // ターン数を表示
      const turnEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(`ターン${this.turn}`)
        .setDescription(`${this.players[0].user} vs ${this.players[1].user}`);
      this.channel.send({ embeds: [turnEmbed] });

      // 次のプレイヤーにアクションの選択を促すメッセージを送信
      const nextPlayer = this.getNextPlayer();
      const actionEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(`${nextPlayer.user.username}のターン`)
        .setDescription("アクションを選択してください")
        .addField("1", "溜める")
        .addField("2", "ガード")
        .addField("3", "攻撃")
        .addField("4", "超攻撃");
      this.channel.send({ embeds: [actionEmbed] });
    }
  }

  // ターンの終了
  endTurn() {
    // タイマーを停止
    clearTimeout(this.timer);

    // 両プレイヤーが準備完了の場合、勝敗を判定して結果を表示
    if (this.players[0].isReady && this.players[1].isReady) {
      const result = this.judge();
      const resultEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(`ターン${this.turn}の結果`)
        .setDescription(`結果: ${result}`)
        .addField(
          this.players[0].user.username,
          `エネルギー: ${this.players[0].energy}`
        )
        .addField(
          this.players[1].user.username,
          `エネルギー: ${this.players[1].energy}`
        );
      this.channel.send({ embeds: [resultEmbed] });

      // 勝敗が決まっていない場合、次のターンを開始
      if (result === "draw") {
        this.turn++;
        this.start();
      } else {
        this.isFinished = true;
      }
    }
  }

  // 勝敗の判定
  judge() {
    const p1 = this.players[0];
    const p2 = this.players[1];
    if (p1.action === "attack" && p2.action === "charge") {
      p1.result = "win";
      p2.result = "lose";
      return `${p1.user.username}の勝ち`;
    }
    if (p1.action === "charge" && p2.action === "attack") {
      p1.result = "lose";
      p2.result = "win";
      return `${p2.user.username}の勝ち`;
    }
    if (
      p1.action === "super" &&
      (p2.action === "charge" ||
        p2.action === "guard" ||
        p2.action === "attack")
    ) {
      p1.result = "win";
      p2.result = "lose";
      return `${p1.user.username}の勝ち`;
    }
    if (
      p2.action === "super" &&
      (p1.action === "charge" ||
        p1.action === "guard" ||
        p1.action === "attack")
    ) {
      p1.result = "lose";
      p2.result = "win";
      return `${p2.user.username}の勝ち`;
    }
    p1.result = "draw";
    p2.result = "draw";
    return "引き分け";
  }

  // 次のプレイヤーを取得
  getNextPlayer() {
    return this.players.find((p) => !p.isReady);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kore")
    .setDescription("2人のユーザーによる対戦ゲーム「kore」")
    .addSubcommand((subcommand) =>
      subcommand.setName("join").setDescription("ゲームに参加する")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("start").setDescription("ゲームを開始する")
    ),
  async execute(interaction) {
    // サブコマンドによる分岐
    switch (interaction.options.getSubcommand()) {
      case "join": {
        // ゲームマネージャーオブジェクトを取得
        console.log(interaction.channelId);
        let manager = interaction.client.koreManager.get(interaction.channelId);
        if (!manager) {
          manager = new GameManager(interaction.channel);
          interaction.client.koreManager.set(interaction.channelId, manager);
          // await interaction.reply("このチャンネルではゲームを開始できません");
          // return;
        }
        // 参加処理
        const user = interaction.user;
        if (manager.addPlayer(user)) {
          await interaction.reply(`${user}がゲームに参加しました`);
        } else {
          await interaction.reply("既に2人揃っています");
        }
        break;
      }
      case "start": {
        // ゲームマネージャーオブジェクトを取得
        const manager = interaction.client.koreManager.get(
          interaction.channelId
        );
        if (!manager) {
          await interaction.reply("このチャンネルではゲームを開始できません");
          return;
        }

        // 開始処理
        if (manager.players.length !== 2) {
          await interaction.reply(
            "2人揃っていないため、ゲームを開始できません"
          );
          return;
        }
        if (manager.isStarted) {
          await interaction.reply("既にゲームが開始されています");
          return;
        }

        // ゲーム開始
        manager.isStarted = true;
        await interaction.reply("ゲームを開始します");
        manager.start();
        break;
      }
      default:
        break;
    }
  },
};
