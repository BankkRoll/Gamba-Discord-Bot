// src/index.js

const axios = require("axios");
require("sapphire-plugin-modal-commands/register");
const { SapphireClient } = require("@sapphire/framework");
const config = require("../config.json");

const client = new SapphireClient({
  intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"],
});

client.once("ready", async () => {
  console.log("Bot is online!");

  try {
    const fetchDataAndUpdateActivities = async () => {
      try {
        const response = await axios.get("https://api.gamba.so/stats");
        const data = response.data;

        const activities = [
          { text: `with ${data.players} players`, type: "PLAYING" },
          { text: `${data.plays} Plays`, type: "LISTENING" },
          { text: `${data.creators} Creators`, type: "WATCHING" },
        ];

        let activityIndex = 0;

        const updateActivity = () => {
          const activity = activities[activityIndex];
          const formattedText = activity.text;

          client.user.setActivity(formattedText, { type: activity.type });

          activityIndex = (activityIndex + 1) % activities.length;
        };

        updateActivity();

        setTimeout(fetchDataAndUpdateActivities, 60 * 1000);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    await fetchDataAndUpdateActivities();
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
});

client.login(config.token);
