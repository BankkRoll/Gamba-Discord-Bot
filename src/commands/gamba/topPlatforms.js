// src/commands/gamba/topPlatforms.js
const { Command } = require("@sapphire/framework");
const axios = require("axios");
const { createEmbed } = require("../../utils/embed");
const config = require("../../../config.json");

module.exports = class TopPlatformsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "topPlatforms",
      description: "Returns top creators by volume in USD.",
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
            .setDescription("Number of top platforms to show")
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("days")
            .setDescription("Number of past days to consider")
            .setRequired(false)
        )
    );
  }

  async chatInputRun(interaction) {
    await interaction.deferReply();

    const limit = interaction.options.getInteger("limit") || 10;
    const days = interaction.options.getInteger("days") || 7;

    axios
      .get(`https://api.gamba.so/platforms?limit=${limit}&days=${days}`)
      .then((response) => {
        const data = response.data;
        const embed = createEmbed({
          title: `🏆 Top ${limit} Platforms`,
          color: config.color,
          description: `Top ${limit} platforms in the last ${days} days:`,
          footer: { text: config.footerText, iconURL: config.footerIcon },
        });

        data.forEach((platform) => {
          embed.addField(
            platform.creator,
            `USD Volume: ${platform.usd_volume}`,
            false
          );
        });

        interaction.editReply({ embeds: [embed] });
      })
      .catch((error) => {
        console.error("Error fetching top platforms:", error);
        interaction.editReply({
          content: "❌ An error occurred while fetching top platforms data.",
          embeds: [],
        });
      });
  }
};
