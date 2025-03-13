// index.ts
import Eris from 'eris';
import { CommandHandler } from './commandHandler';
require('dotenv').config();

const bot = new Eris.Client(`Bot ${process.env.TOKEN}`, {
    intents: ["guilds", "guildMembers", "guildPresences", "guildMessages", "messageContent"]
});

const commandHandler = new CommandHandler(bot);

commandHandler.registerEvents();

bot.on("ready", async () => {
    console.log(`Ready on ${bot.user.username}`);
    bot.editStatus("idle", {
        name: "over the server",
        type: 3
    });
    await commandHandler.registerSlashCommands(); // No need to wait for cache; listener handles it
});

bot.on("error", (error: any) => {
    if (error.code === 1006) return;
    console.error(error);
});

bot.connect();