import Eris from 'eris';
import { Command } from '../types/command';
import { fingerguns } from '../secret/emoji.json'
export default (bot: Eris.Client): Command => ({
    name: 'yo',
    description: 'Greet users with a friendly message',
    type: 'messageCreate',
    async execute(msg: Eris.Message): Promise<void> {
        if (msg.author.id === bot.user.id) return;

        if (msg.content.toLowerCase() !== 'yo') return;

        await msg.channel.createMessage({
            content: `<:fingerguns:${fingerguns}> Yo!`,
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