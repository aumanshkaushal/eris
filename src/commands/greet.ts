import Eris from 'eris';
import { databaseManager } from '../lib/database';
import { Command } from '../types/command';
import { herole, sherole, theyrole } from '../secret/roles.json';
export default (bot: Eris.Client): Command => ({
    name: 'greet',
    description: 'Simple ping command',
    type: 'messageCreate',
    async execute(msg: Eris.Message): Promise<void> {
        if (msg.author.id === bot.user.id) return;

        if (msg.content.toLowerCase() !== 'hello' && msg.content.toLowerCase() !== 'hi') return;

        const userPronouns = await databaseManager.getUserPronouns(msg.author.id);
        let content = '';
        let prefix = ['hello', 'hi'][Math.floor(Math.random() * 2)];
        if (userPronouns) {
            content = `${prefix} ${userPronouns}`;
        } else {
            if (msg.member?.roles.includes(herole)) {
                content = `${prefix} bhaiya!`;
            }
            else if (msg.member?.roles.includes(sherole)) {
                content = `${prefix} didi!`;
            } else {
                content = `Greetings!`;
            }
        }

        await msg.channel.createMessage({
            content,
            messageReference: {
                messageID: msg.id,
                channelID: msg.channel.id
            },
            allowedMentions: {
                everyone: false,
                roles: [],
                users: [],
                repliedUser: false
            }
        });
        
        
    }
});