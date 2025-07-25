import Eris from 'eris';
import { Command } from '../../../types/command';
import channels from '../../../secret/channels.json';
import emoji from '../../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'messageUpdate',
    description: 'Logs updated messages',
    type: 'messageUpdate',
    async execute(message: Eris.Message, oldMessage: Eris.Message): Promise<void> {
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
                            `**Message edited by <@${message.author.id}> in <#${message.channel.id}> ([Jump to Message](${message.jumpLink}))**`,
                            `**Before:**`,
                            oldMessage.content || 'No content',
                            `**After:**`,
                            message.content || 'No content',
                        ].join(`\n`),
                        color: 0xADD8E6,
                    }
                }
            );
        } catch (error) {
            console.error('Failed to log message update:', error);
        }
    }
});