// src/commands/admin/setup.js
const { Command } = require("@sapphire/framework");
const { guildSettings } = require("../../../db");
const { MessageEmbed } = require("discord.js");

module.exports = class SetupCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "setup",
      description: "Initialize the bot for first-time use on the server.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  async chatInputRun(interaction) {
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      const embed = new MessageEmbed()
        .setColor("#FF0000")
        .setDescription("❌ You don't have permission to use this command.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const guildId = interaction.guild.id;

    const currentEventsChannelId = guildSettings.get(guildId, "eventsChannel");
    if (currentEventsChannelId) {
      const existingChannelEmbed = new MessageEmbed()
        .setTitle("Bot Setup")
        .setColor("#3498DB")
        .setDescription(
          `An events channel is already configured: <#${currentEventsChannelId}>.\n\nReply with a new channel to update it, or type 'cancel' to abort.`
        );

      const existingChannelMessage = await interaction.reply({
        embeds: [existingChannelEmbed],
        fetchReply: true,
      });

      const filter = (response) => {
        return (
          response.author.id === interaction.user.id &&
          response.mentions.channels.size > 0
        );
      };

      try {
        const collected = await interaction.channel.awaitMessages({
          filter,
          max: 1,
          time: 60000,
          errors: ["time"],
        });
        const newEventsChannelId = collected
          .first()
          .mentions.channels.first().id;
        guildSettings.set(guildId, newEventsChannelId, "eventsChannel");
        existingChannelEmbed.setDescription(
          `✅ Events channel successfully updated to <#${newEventsChannelId}>.`
        );
        await existingChannelMessage.edit({ embeds: [existingChannelEmbed] });
      } catch (error) {
        existingChannelEmbed
          .setColor("#FF0000")
          .setDescription(
            "⚠️ Setup was not completed in time or an error occurred. Events channel remains unchanged."
          );
        await existingChannelMessage.edit({ embeds: [existingChannelEmbed] });
      }
    } else {
      const setupEmbed = new MessageEmbed()
        .setTitle("Bot Setup")
        .setColor("#3498DB")
        .setDescription(
          "Welcome to the bot setup process!\n\nPlease mention the channel where you want game settled events to be posted."
        );

      const initialMessage = await interaction.reply({
        embeds: [setupEmbed],
        fetchReply: true,
      });

      const filter = (response) => {
        return (
          response.author.id === interaction.user.id &&
          response.mentions.channels.size > 0
        );
      };

      try {
        const collected = await interaction.channel.awaitMessages({
          filter,
          max: 1,
          time: 60000,
          errors: ["time"],
        });
        const eventsChannelId = collected.first().mentions.channels.first().id;
        guildSettings.set(guildId, eventsChannelId, "eventsChannel");

        setupEmbed.setDescription(
          `✅ Events channel successfully set to <#${eventsChannelId}>.`
        );
        await initialMessage.edit({ embeds: [setupEmbed] });
      } catch (error) {
        setupEmbed
          .setColor("#FF0000")
          .setDescription(
            "⚠️ Setup was not completed in time or an error occurred."
          );
        await initialMessage.edit({ embeds: [setupEmbed] });
      }
    }
  }
};
