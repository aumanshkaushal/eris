import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { crown, frost } from '../../secret/emoji.json'

export default (bot: Eris.Client): Command => ({
    name: 'bump_check_leaderboard',
    description: 'Check the leaderboard for the support points',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.MESSAGE_COMPONENT) return;

        const componentInteraction = interaction as Eris.ComponentInteraction;
        if (componentInteraction.data.custom_id !== 'bump_check_leaderboard') return;

        try {
            await componentInteraction.defer(Eris.Constants.MessageFlags.EPHEMERAL);
            
            const users = await databaseManager.getTopUsers();
            const leaderboardEntries = await Promise.all(
                users.map(async (user, index) => {
                    return index === 0
                        ? `<:crown:${crown}> <@${user.id}> ↦ \`${user.supportpoints}\``
                        : `<:frost:${frost}> <@${user.id}> ↦ \`${user.supportpoints}\``;
                })
            );
            const leaderboard = leaderboardEntries.join('\n');
            let userID = componentInteraction.user?.id;
            if (!userID) {
                userID = componentInteraction.member?.id || '';
            }

            await componentInteraction.createFollowup({
                embeds: [{
                    color: 0xffffff,
                    author: {
                        name: componentInteraction.member?.guild.name || 'The CBSE Community',
                        icon_url: componentInteraction.member?.guild.iconURL || undefined
                    },
                    description: leaderboard || 'No users in the leaderboard yet!',
                    image: {
                        url: 'https://cdn.discordapp.com/attachments/948989141562040370/1117037169840750682/1686392804883.jpg'
                    },
                    footer: {
                        text: `You are currently at #${await databaseManager.getLeaderboardPosition(userID)}/${await databaseManager.getTotalUsers()}`
                    }
                }]
            });
        } catch (error) {
            console.error('Error generating leaderboard:', error);
            await componentInteraction.createFollowup({
                content: 'Failed to load leaderboard. Try again later!',
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});