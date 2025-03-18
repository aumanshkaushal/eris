import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { crown, frost } from '../../secret/emoji.json';

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
            const leaderboardEntries = await Promise.all(
                users.map(async (user, index) => {
                    const supportPoints = await databaseManager.getSupportPoints(user);
                    return index === 0
                        ? `<:crown:${crown}> <@${user}> ↦ \`${supportPoints}\``
                        : `<:frost:${frost}> <@${user}> ↦ \`${supportPoints}\``;
                })
            );
            const leaderboard = leaderboardEntries.join('\n');

            await commandInteraction.createFollowup({
                embeds: [{
                    color: 0xffffff,
                    author: {
                        name: commandInteraction.member?.guild.name || 'The CBSE Community',
                        icon_url: commandInteraction.member?.guild.iconURL || undefined
                    },
                    description: leaderboard || 'No users in the leaderboard yet!',
                    image: {
                        url: 'https://cdn.discordapp.com/attachments/948989141562040370/1117037169840750682/1686392804883.jpg'
                    }
                }]
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