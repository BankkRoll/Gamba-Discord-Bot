// src/commands/gamba/settledGames.js
const { Command } = require("@sapphire/framework");
const axios = require("axios");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../../../config.json");
const poolsConfig = require("../../utils/pools");

module.exports = class SettledGamesCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "settledGames",
      description: "Shows recent settled games.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption((option) =>
          option
            .setName("page")
            .setDescription("Page number to retrieve")
            .setRequired(false)
        )
    );
  }

  async chatInputRun(interaction) {
    const page = interaction.options.getInteger("page") || 1;
    const limit = 10;

    await interaction.deferReply();

    axios
      .get(`https://api.gamba.so/events/settledGames?page=${page}`)
      .then((response) => {
        const { total, results } = response.data;
        const embed = new MessageEmbed()
          .setTitle("🎲 Settled Games")
          .setColor(config.color)
          .setDescription(
            `Here are the recently settled games from page ${page}:`
          )
          .setFooter(config.footerText, config.footerIcon);

        results.forEach((game) => {
          const poolConfig = poolsConfig[game.token.toString()];
          if (!poolConfig) {
            console.log(
              `No pool configuration found for token: ${game.token.toString()}`
            );
            return;
          }
          const formattedWager = this.formatAmount(
            game.wager,
            poolConfig.decimals
          );
          const formattedPayout = this.formatAmount(
            game.payout,
            poolConfig.decimals
          );
          const formattedMultiplier = `${game.multiplier / 100}%`;
          const formattedTime = new Date(game.time).toLocaleString();
          embed.addField(
            `🎲 Game: ${game.signature}`,
            `**User:** ${game.user}\n` +
              `**Creator:** ${game.creator}\n` +
              `**Token:** ${poolConfig.name}\n` +
              `**Wager:** ${formattedWager} ${poolConfig.symbol}\n` +
              `**Payout:** ${formattedPayout} ${poolConfig.symbol}\n` +
              `**Multiplier:** ${formattedMultiplier}\n` +
              `**Time:** ${formattedTime}`,
            false
          );
        });

        interaction.editReply({ embeds: [embed] });
      })
      .catch((error) => {
        console.error("Error fetching settled games:", error);
        interaction.editReply({
          content: "❌ An error occurred while fetching settled games.",
          embeds: [],
        });
      });
  }

  formatAmount(amount, decimals) {
    return (amount / Math.pow(10, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};
