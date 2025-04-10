require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });
import Eris from 'eris';
import { CommandHandler } from './commandHandler';
import { databaseManager } from './lib/database';

const bot = new Eris.Client(`Bot ${process.env.TOKEN}`, {
    intents: ["guilds", "guildMembers", "guildPresences", "guildMessages", "messageContent"]
});

const commandHandler = new CommandHandler(bot);

commandHandler.registerEvents();

bot.on("ready", async () => {
    console.log(`Ready on ${bot.user.username}, DB: ${databaseManager ? 'ready' : 'not ready'}`);
    bot.editStatus("idle", { name: "over the server", type: 3 });
    await commandHandler.registerSlashCommands();
});

bot.on("error", (error: any) => {
    if (error.code === 1006) return;
    console.error(error);
});

bot.connect();