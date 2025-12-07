import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import emoji from '../../secret/emoji.json';
import { winterTheme } from '../../secret/config.json';
import fs from 'fs';

export default (bot: Eris.Client): Command => ({
    name: 'leaderboard',
    description: 'Check the leaderboard for the support points',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.APPLICATION_COMMAND) return;

        const commandInteraction = interaction as Eris.CommandInteraction;

        try {
            await commandInteraction.defer();

            const users = await databaseManager.getTopUsers();
            const leaderboardEntries = users.map((user, index) => {
                const supportPoints = user.supportpoints;
                return index === 0
                    ? `${winterTheme? `<:blue_crown:${emoji.blue_crown}>`: `<:crown:${emoji.crown}>`} <@${user.id}> ↦ \`${supportPoints}\``
                    : `<:frost:${emoji.frost}> <@${user.id}> ↦ \`${supportPoints}\``;
            });
            const leaderboard = leaderboardEntries.join('\n');

            await commandInteraction.createFollowup({
                embeds: [{
                    color: winterTheme? 0x97c1e6 : 0xffffff,
                    author: {
                        name: commandInteraction.member?.guild.name || 'The CBSE Community',
                        icon_url: commandInteraction.member?.guild.iconURL || undefined
                    },
                    description: leaderboard || 'No users in the leaderboard yet!',
                    image: {
                        url: 'attachment://cbseCommunityBanner.jpg'
                    }
                }]
            }, {
                file: fs.readFileSync(winterTheme? './assets/cbseCommunityXmasBanner.jpg' : './assets/cbseCommunityBanner.jpg'),
                name: 'cbseCommunityBanner.jpg'
            });
        } catch (error) {
            console.error('Error generating leaderboard:', error);
            try {
                await commandInteraction.createFollowup({
                    content: 'Failed to load leaderboard. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending leaderboard error message:', followupError);
            }
        }
    }
});