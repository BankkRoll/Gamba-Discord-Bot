// db.js
const Enmap = require("enmap");

/**
 * @type {import("enmap").default}
 * Custom settings for each guild.
 */
const guildSettings = new Enmap({
  name: "guildSettings",
  autoEnsure: {
    eventsChannel: null,
  },
  ensureProps: true,
});

module.exports = {
  guildSettings,
};
