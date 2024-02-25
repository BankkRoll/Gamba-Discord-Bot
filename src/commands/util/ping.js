// src/commands/util/ping.js
const { Command } = require("@sapphire/framework");
const { createEmbed } = require("../../utils/embed");

module.exports = class PingCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "ping",
      description: "Measure the bot's response time in milliseconds.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  async chatInputRun(interaction) {
    await interaction.deferReply();

    const emoji = "🟢";
    const iterations = 5;
    let latency = 0;

    for (let i = 0; i < iterations; i++) {
      const title = `${emoji.repeat((i % 10) + 1)}`;

      await new Promise((resolve) => setTimeout(resolve, 1));

      const embed = createEmbed({
        title,
        description: `🏓 Pong! Average latency is ${latency.toFixed(2)}ms.`,
      });
      const msg = await interaction.editReply({ embeds: [embed] });
      const currentLatency =
        msg.createdTimestamp - interaction.createdTimestamp;
      latency += currentLatency;
    }

    latency /= iterations;

    const finalEmbed = createEmbed({
      description: `🏓 Pong! Average latency is ${latency.toFixed(2)}ms.`,
    });
    await interaction.editReply({ embeds: [finalEmbed] });
  }
};
