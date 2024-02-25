// src/commands/gamba/topPlays.js

const { Command } = require("@sapphire/framework");
const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const config = require("../../../config.json");

module.exports = class TopPlaysCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "topPlays",
      description: "Lists top plays by USD profit.",
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
            .setDescription("The number of top plays to display")
            .setRequired(false)
        )
    );
  }

  async chatInputRun(interaction) {
    const limit = interaction.options.getInteger("limit") || 10;

    await interaction.deferReply();

    axios
      .get(`https://api.gamba.so/top-plays?limit=${limit}`)
      .then((response) => {
        const plays = response.data;
        const embed = new MessageEmbed()
          .setTitle("💰 Top Plays by Profit")
          .setColor(config.color)
          .setDescription(
            `Here are the top ${limit} plays based on USD profit:`
          )
          .setFooter(config.footerText, config.footerIcon);

        plays.slice(0, limit).forEach((play) => {
          embed.addField(
            play.user,
            `Profit: ${play.usd_profit}, Multiplier: ${play.multiplier}`,
            false
          );
        });

        interaction.editReply({ embeds: [embed] });
      })
      .catch((error) => {
        console.error("Error fetching top plays:", error);
        interaction.editReply({
          content: "❌ An error occurred while fetching top plays data.",
          embeds: [],
        });
      });
  }
};
