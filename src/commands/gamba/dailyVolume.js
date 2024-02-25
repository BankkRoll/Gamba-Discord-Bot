// src/commands/gamba/dailyVolume.js
const { Command } = require("@sapphire/framework");
const axios = require("axios");
const { createEmbed } = require("../../utils/embed");
const config = require("../../../config.json");

module.exports = class DailyUsdVolumeCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "dailyVolume",
      description: "Shows daily USD volume.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("creator")
            .setDescription("Filter by a specific creator address")
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("limit")
            .setDescription("Number of days to display")
            .setRequired(false)
        )
    );
  }

  async chatInputRun(interaction) {
    const creator = interaction.options.getString("creator");
    const limit = interaction.options.getInteger("limit") || 10;

    await interaction.deferReply();

    const url = creator
      ? `https://api.gamba.so/daily-usd?creator=${creator}`
      : `https://api.gamba.so/daily-usd`;

    axios
      .get(url)
      .then((response) => {
        const volumes = response.data.slice(0, limit);
        const embed = createEmbed({
          title: "📈 Daily USD Volume",
          description: creator
            ? `Daily USD volume for ${creator} (last ${limit} days):`
            : `Daily USD volume across all creators (last ${limit} days):`,
          footer: { text: config.footerText, icon: config.footerIcon },
        });

        volumes.forEach((volume) => {
          embed.addField(
            `Date: ${volume.date}`,
            `Total Volume: ${volume.total_volume}`,
            false
          );
        });

        interaction.editReply({ embeds: [embed] });
      })
      .catch((error) => {
        console.error("Error fetching daily USD volume:", error);
        interaction.editReply({
          content: "❌ An error occurred while fetching daily USD volume data.",
          embeds: [],
        });
      });
  }
};
