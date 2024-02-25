// src/commands/admin/info.js
const { Command } = require("@sapphire/framework");
const { createEmbed } = require("../../utils/embed");
const axios = require("axios");
const { guildSettings } = require("../../../db");

module.exports = class InfoCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "info",
      description:
        "Retrieve information about the events channel and Gamba stats.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  async chatInputRun(interaction) {
    const guildId = interaction.guild.id;
    const settings = guildSettings.get(guildId);

    try {
      const gambaStatsResponse = await axios.get("https://api.gamba.so/stats");
      const gambaStatsData = gambaStatsResponse.data;

      const formattedGambaStats = {
        ...gambaStatsData,
        players: Number(gambaStatsData.players).toLocaleString(),
        usd_volume: Number(gambaStatsData.usd_volume).toLocaleString(),
        plays: Number(gambaStatsData.plays).toLocaleString(),
        creators: Number(gambaStatsData.creators).toLocaleString(),
        revenue_usd: Number(gambaStatsData.revenue_usd).toLocaleString(),
        player_net_profit_usd: Number(
          gambaStatsData.player_net_profit_usd
        ).toLocaleString(),
        active_players: Number(gambaStatsData.active_players).toLocaleString(),
      };

      const serverInfoEmbed = createEmbed({
        title: "🤖 Server Information Panel",
        description:
          "Detailed server info about the bot and its configurations.",
        fields: [
          {
            name: "Server Settings",
            value: `Channel: <#${settings.eventsChannel}>`,
            inline: true,
          },
        ],
      });

      const gambaStatsEmbed = createEmbed({
        title: "🎮 Gamba Stats",
        fields: [
          {
            name: "👥 Players",
            value: formattedGambaStats.players,
            inline: true,
          },
          {
            name: "💵 USD Volume",
            value: formattedGambaStats.usd_volume,
            inline: true,
          },
          {
            name: "🎲 Plays",
            value: formattedGambaStats.plays,
            inline: true,
          },
          {
            name: "🧑‍🎨 Creators",
            value: formattedGambaStats.creators,
            inline: true,
          },
          {
            name: "💰 Revenue (USD)",
            value: formattedGambaStats.revenue_usd,
            inline: true,
          },
          {
            name: "💸 Player Net Profit (USD)",
            value: formattedGambaStats.player_net_profit_usd,
            inline: true,
          },
          {
            name: "🕹️ Active Players",
            value: formattedGambaStats.active_players,
            inline: true,
          },
        ],
      });

      await interaction.reply({ embeds: [serverInfoEmbed, gambaStatsEmbed] });
    } catch (error) {
      console.error("Error fetching Gamba stats:", error);
      const embed = createEmbed({
        description: "❌ An error occurred while fetching Gamba stats.",
      });
      await interaction.reply({ embeds: [embed] });
    }
  }
};
