## Gamba Discord Bot

![Screenshot 2024-02-24 230456](https://github.com/BankkRoll/BankkRoll/assets/106103625/7c23dd8a-1dc0-412f-ae3f-f2c1f07a4aea)

Track live events on the Gamba platform. Also track various metrics such as daily volume, pool changes, top platforms, top players, top plays, and much more!

### Installation

To install and run the bot, follow these steps:

## Installation

1. Fork this repo and clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies:

```
npm install
```

4. **Configuration**: Set up the `config.json` file by providing the required configuration parameters:

   - `token`: Your Discord bot token. You can obtain this by creating a new bot application on the Discord Developer Portal.
   - `solanaRpcUrl`: Your RPC endpoint.

   ```json
   {
     "token": "YOUR_DISCORD_BOT_TOKEN",
     "solanaRpcUrl": "YOUR_SOLANA_RPC_URL",
     "color": "#FF0000",
     "footerText": "Developed By: Bankkroll",
     "footerIcon": "https://i.ibb.co/8N41nV7/imageedit-4-5545101709.png"
   }
   ```

5. **Start the Bot**: Run the bot using Node.js:

   ```shell
   npm start
   ```

### Usage

Once the bot is running and added to your Discord server, you can use the following commands:

- **Admin Only Commands**:

  - `/setup`: Initialize the bot for first-time use on the server.

- **Gamba Commands**:

  - `/dailyvolume`: Shows daily USD volume.
  - `/poolchanges`: Shows recent changes in a specified pool.
  - `/pools`: Shows pool data.
  - `/settledgames`: Shows recent settled games.
  - `/topplatforms`: Returns top creators by volume in USD.
  - `/topplayer`: Retrieves a list of top-performing players based on various metrics.
  - `/topplays`: Lists top plays by USD profit.

- **Utility Commands**:
  - `/info`: Retrieve information about the set channel and Gamba stats.
  - `/help`: Displays information about available commands.
  - `/ping`: Measure the bot's response time in milliseconds.

### Contributing

Contributions to this project are welcome! Feel free to submit pull requests with any improvements or bug fixes.

### License

This project is licensed under the [MIT License](LICENSE).
