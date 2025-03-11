import Eris from 'eris';
import { Command } from '../../types/command';
import { getTopUsers } from '../../lib/supportPoints/getTopUsers';
import { getSupportPoints } from '../../lib/supportPoints/getSupportPoints';

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
            await componentInteraction.defer();

            const users = await getTopUsers();
            const leaderboardEntries = await Promise.all(
                users.map(async (user, index) => {
                    const supportPoints = await getSupportPoints(user);
                    return index === 0
                        ? `<:crown:1349096568556355615> <@${user}> ↦ \`${supportPoints}\``
                        : `<:frost:1349096574319333416> <@${user}> ↦ \`${supportPoints}\``;
                })
            );
            const leaderboard = leaderboardEntries.join('\n');

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