// src/commands/gamba/topPlayer.js

const { Command } = require("@sapphire/framework");
const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const config = require("../../../config.json");

module.exports = class TopPlayersCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "topPlayers",
      description:
        "Retrieves a list of top-performing players based on various metrics.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption((option) =>
          option
            .setName("limit")
            .setDescription("Number of players to list")
            .setRequired(false)
        )
    );
  }

  async chatInputRun(interaction) {
    const limit = interaction.options.getInteger("limit") || 10; // Default to listing 10 players
    await interaction.deferReply();

    axios
      .get(`https://api.gamba.so/players?sortBy=${sortBy}&limit=${limit}`)
      .then((response) => {
        const players = response.data.players;
        const embed = new MessageEmbed()
          .setTitle(`🏅 Top ${limit} Players`)
          .setColor(config.color)
          .setDescription(`Top ${limit} players by:`)
          .setFooter(config.footerText, config.footerIcon);

        players.forEach((player) => {
          embed.addField(
            player.user,
            `Profit: ${player.usd_profit}, Volume: ${player.usd_volume}`,
            false
          );
        });

        interaction.editReply({ embeds: [embed] });
      })
      .catch((error) => {
        console.error("Error fetching top players:", error);
        interaction.editReply({
          content: "❌ An error occurred while fetching top players data.",
          embeds: [],
        });
      });
  }
};
