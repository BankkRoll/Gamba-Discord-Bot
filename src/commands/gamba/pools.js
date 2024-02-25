// src/commands/gamba/pools.js
const { Command } = require("@sapphire/framework");
const axios = require("axios");
const { createEmbed } = require("../../utils/embed");
const config = require("../../../config.json");
const poolsConfig = require("../../utils/pools");

module.exports = class PoolsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "pools",
      description: "Fetches pool data for all pools.",
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
            .setDescription("The number of pools to display")
            .setRequired(false)
        )
    );
  }

  async chatInputRun(interaction) {
    const limit = interaction.options.getInteger("limit") || 10;

    await interaction.deferReply();

    axios
      .get("https://api.gamba.so/pools")
      .then((response) => {
        const data = response.data;
        const embed = createEmbed({
          title: "🏊 Pool Data",
          description: `Current pool data (showing up to ${limit} entries):`,
          footer: { text: config.footerText, iconURL: config.footerIcon },
        });

        data.pools.slice(0, limit).forEach((pool) => {
          const poolConfig = poolsConfig[pool.token.toString()];
          if (!poolConfig) {
            console.log(
              `No pool configuration found for token: ${pool.token.toString()}`
            );
            return;
          }
          embed.addField(
            `${poolConfig.name} (${poolConfig.symbol})`,
            `**Pool:** ${pool.pool}\n` +
              `**Total:** ${pool.total}\n` +
              `**Total USD:** ${pool.total_usd}`,
            false
          );
        });

        interaction.editReply({ embeds: [embed] });
      })
      .catch((error) => {
        console.error("Error fetching pool data:", error);
        interaction.editReply({
          content: "❌ An error occurred while fetching pool data.",
          embeds: [],
        });
      });
  }
};
