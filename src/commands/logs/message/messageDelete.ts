import Eris from 'eris';
import { Command } from '../../../types/command';
import channels from '../../../secret/channels.json';
import emoji from '../../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'messageDelete',
    description: 'Logs deleted messages',
    type: 'messageDelete',
    async execute(message: Eris.Message): Promise<void> {
        if (!message.guildID) return;
        if (message.member?.bot) return;

        try {
            await bot.createMessage(
                channels.messageLogs.id,
                {
                    embed: {
                        author: {
                            name: `${message.author.username}`,
                            icon_url: message.author.avatarURL || message.author.defaultAvatarURL,
                        },
                        description: [
                            `**Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>**`,
                            `${message.content || 'No content'}`,
                        ].join(`\n`),
                        color: 0xDC143C,
                        footer: {
                            text: `Author: ${message.author.id} | Message ID: ${message.id}`,
                        },
                        timestamp: new Date(message.timestamp).toISOString(),
                    }
                }
            );
        } catch (error) {
            console.error('Failed to log message deletion:', error);
        }
    }
});