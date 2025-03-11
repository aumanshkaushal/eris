import Eris from 'eris';
import * as dotenv from 'dotenv';
import { CommandHandler } from './commandHandler';

dotenv.config();

const bot = new Eris.Client(`Bot ${process.env.TOKEN}`, {
    intents: ["guilds", "guildMembers", "guildPresences", "guildMessages", "messageContent"]
});

const commandHandler = new CommandHandler(bot);

commandHandler.registerEvents();

bot.on("ready", () => {
    console.log(`Ready on ${bot.user.username}`);
    bot.editStatus("idle", {
        name: "over the server",
        type: 3
    });
    commandHandler.registerSlashCommands();
});

bot.connect();