// src/listeners/gameSettledListener.js

const { Events, Listener } = require("@sapphire/framework");
const { Connection } = require("@solana/web3.js");
const { GambaProvider } = require("gamba-core-v2");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { guildSettings } = require("../../db");
const config = require("../../config.json");
const poolsConfig = require("../utils/pools");

class GameSettledListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      once: false,
      event: Events.ClientReady,
    });
  }

  async run(client) {
    const web3Connection = new Connection(config.solanaRpcUrl, "confirmed");
    const gambaProvider = new GambaProvider(web3Connection, {
      commitment: "confirmed",
    });

    gambaProvider.gambaProgram.addEventListener(
      "GameSettled",
      async (data, slot, signature) => {
        client.guilds.cache.forEach(async (guild) => {
          const eventsChannelId = guildSettings.get(guild.id, "eventsChannel");

          if (!eventsChannelId) {
            return;
          }

          const channel = await client.channels.fetch(eventsChannelId);
          if (channel.isText()) {
            const { embeds, components } = this.createGameSettledEmbed(
              data,
              signature
            );
            channel.send({ embeds, components });
          }
        });
      }
    );
  }

  createGameSettledEmbed(data, signature) {
    const poolConfig = poolsConfig[data.tokenMint.toString()];
    if (!poolConfig) {
      console.log(
        `No pool configuration found for token mint: ${data.tokenMint.toString()}`
      );
      return;
    }

    const decimals = poolConfig ? poolConfig.decimals : 9;
    const formattedWager = this.formatAmount(data.wager, decimals);
    const formattedPayout = this.formatAmount(data.payout, decimals);
    const isWin = data.payout.gt(data.wager);
    const resultEmoji = isWin ? "🟢" : "🔴";
    const resultText = isWin ? "WON" : "LOST";
    const color = isWin ? "#4CAF50" : "#F44336";

    const shortUser = `${data.user.toString().slice(0, 4)}...${data.user
      .toString()
      .slice(-4)}`;
    const shortCreator = `${data.creator
      .toString()
      .slice(0, 4)}...${data.creator.toString().slice(-4)}`;
    const metadataInfo = data.metadata
      ? data.metadata.split(":")[1].trim().charAt(0).toUpperCase() +
        data.metadata.split(":")[1].trim().slice(1)
      : "Game";

    const embed = new MessageEmbed()
      .setTitle(`${resultEmoji} ${metadataInfo} ${resultText} ${resultEmoji}`)
      .setColor(color)
      .addField(
        "User",
        `[${shortUser}](https://explorer.solana.com/address/${data.user.toString()})`,
        true
      )
      .addField(
        "Creator",
        `[${shortCreator}](https://explorer.solana.com/address/${data.creator.toString()})`,
        true
      )
      .addField("Token", poolConfig ? poolConfig.name : "Unknown Pool", true)
      .addField(
        "Wager",
        `${formattedWager} ${poolConfig ? poolConfig.symbol : ""}`,
        true
      )
      .addField(
        "Payout",
        `${formattedPayout} ${poolConfig ? poolConfig.symbol : ""}`,
        true
      )
      .addField("Multiplier", `${data.multiplierBps / 100}%`, true)
      .setTimestamp()
      .setThumbnail(poolConfig.icon)
      .setURL(`https://explorer.gamba.so/tx/${signature}`)
      .setFooter(config.footerText, config.footerIcon);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("View on Gamba Explorer")
        .setStyle("LINK")
        .setURL(`https://explorer.gamba.so/tx/${signature}`),
      new MessageButton()
        .setLabel("View on Solscan")
        .setStyle("LINK")
        .setURL(`https://solscan.io/tx/${signature}`)
    );

    return { embeds: [embed], components: [row] };
  }

  formatAmount(amount, decimals) {
    return (amount / Math.pow(10, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

module.exports = {
  GameSettledListener,
};
