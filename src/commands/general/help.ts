import Eris from 'eris';
import { Command } from '../../types/command';
import emoji from '../../secret/emoji.json';
import { prefix, developerID, winterTheme } from '../../secret/config.json';
import { version } from '../../../package.json';
import fs from 'fs';

export default (bot: Eris.Client): Command => ({
    name: 'help',
    description: 'Shows the help menu',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.APPLICATION_COMMAND) return;

        const commandInteraction = interaction as Eris.CommandInteraction;
        await commandInteraction.defer();

        try {
            commandInteraction.createFollowup({
                embeds: [{
                    color: winterTheme? 0x97c1e6 : 0xffffff,
                    author: {
                        name: bot.user.username + '#' + bot.user.discriminator || 'User not found',
                        icon_url: bot.user.avatarURL || ''
                    },
                    description: [
                        `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **General Information:**`,
                        `<:replycontinued:${emoji.replycontinued}> Prefix: \`${prefix}\``,
                        `<:replycontinued:${emoji.replycontinued}> Websocket Ping: \`${bot.shards.get(0)?.latency}ms\``,
                        `<:replycontinued:${emoji.replycontinued}> Uptime: \`${bot.uptime ? Math.floor(bot.uptime / 1000 / 60) : 0} minutes\``,
                        `<:replycontinued:${emoji.replycontinued}> Environment: \`${process.env.NODE_ENV || 'development'}\``,
                        `<:replycontinued:${emoji.replycontinued}> Eris Version: \`${Eris.VERSION}\``,
                        `<:replycontinued:${emoji.replycontinued}> Source Version: \`${version}\``,
                        `<:replycontinued:${emoji.replycontinued}> Node.js Version: \`${process.version}\``,
                        `<:reply:${emoji.reply}> Developer: \`${bot.users.get(developerID)?.username}\` | <@${developerID}>`,
                        ``,
                        `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **General Commands:**`,
                        `<:replycontinued:${emoji.replycontinued}> \`/help\` - Shows this help menu`,
                        `<:replycontinued:${emoji.replycontinued}> \`/ping\` - Shows the bot's latency`,
                        `<:replycontinued:${emoji.replycontinued}> \`/stream info\` - Shows the number of students in each stream`,
                        `<:replycontinued:${emoji.replycontinued}> \`/profile\` - Shows your or someone else's profile`,
                        `<:reply:${emoji.reply}> \`/leaderboard\` - Shows the leaderboard for support points`,
                        ``,
                        `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Resource Commands:**`,
                        `<:replycontinued:${emoji.replycontinued}> \`/resource add\` - Adds a resource to the database`,
                        `<:reply:${emoji.reply}> \`/resource search\` - Searches for a resource in the database`,
                    ].join('\n'),
                    image: {
                        url: 'attachment://cbseCommunityBanner.jpg'
                    }
                }]
            }, {
                file: fs.readFileSync(winterTheme? './assets/cbseCommunityXmasBanner.jpg' : './assets/cbseCommunityBanner.jpg'),
                name: 'cbseCommunityBanner.jpg'
            });
            

        } catch (error) {
            console.error('Error creating help menu:', error);
            try {
                await commandInteraction.createFollowup({
                    content: 'Failed to create help menu. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error creating help menu error message:', followupError);
            }
        }
    }
});