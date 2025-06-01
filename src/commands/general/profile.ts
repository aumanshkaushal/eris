import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { stars, heart, reply, replycontinued } from '../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'profile',
    description: 'Fetches the profile of a user',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [{
        name: "user",
        description: "Member whose profile you want to fetch",
        type: Eris.Constants.ApplicationCommandOptionTypes.USER,
        required: false
    } as Eris.ApplicationCommandOptions],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.APPLICATION_COMMAND) return;

        const commandInteraction = interaction as Eris.CommandInteraction;

        try {
            await commandInteraction.defer();

            // Get the target user ID
            let target = (commandInteraction.data.options?.find(option => option.name === 'user') as Eris.InteractionDataOptionsUser)?.value;
            if (!target) {
                target = commandInteraction.user?.id || commandInteraction.member?.id || '';
            }

            // Fetch the User object
            const user = bot.users.get(target);
            if (!user) {
                await commandInteraction.createFollowup({
                    content: 'User not found.',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            // Fetch the GuildMember object
            const guild = bot.guilds.get(commandInteraction.guildID ?? '');
            let member: Eris.Member | undefined;
            if (guild) {
                member = guild.members.get(target);
                if (!member) {
                    // If the member isn't in the cache, try to fetch them
                    try {
                        const members = await guild.fetchMembers({ userIDs: [target], limit: 1 });
                        member = members[0];
                    } catch (fetchError) {
                        console.warn(`Failed to fetch member ${target} from guild ${guild.id}:`, fetchError);
                    }
                }
            }

            // Calculate timestamps
            const createdAtTimestamp = user.createdAt ?? Date.now(); // Fallback to current time if createdAt is missing
            const createdAtSeconds = Math.round(createdAtTimestamp / 1000);

            const joinedAtTimestamp = member?.joinedAt; // joinedAt is undefined if member isn't found
            const joinedAtText = joinedAtTimestamp
                ? `<t:${Math.round(joinedAtTimestamp / 1000)}:F> (<t:${Math.round(joinedAtTimestamp / 1000)}:R>)`
                : 'Not in server';

            // Prepare the embed
            const embed: Eris.EmbedOptions = {
                color: 0xFFFFFF,
                image: {
                    url: "https://cdn.discordapp.com/attachments/948989141562040370/1117037169840750682/1686392804883.jpg"
                },
                author: {
                    name: user.username || 'User not found',
                    icon_url: user.avatarURL || ''
                },
                description: [
                    `<a:heart:${heart}> **Created account on:**`,
                    `<:reply:${reply}> <t:${createdAtSeconds}:F> (<t:${createdAtSeconds}:R>)`,
                    ``,
                    `<a:heart:${heart}> **Joined server on:**`,
                    `<:reply:${reply}> ${joinedAtText}`,
                    ``,
                    `<a:heart:${heart}> **Resource Statistics:**`,                        
                    `<:replycontinued:${replycontinued}> **Resources Submitted:** \`${await databaseManager.getTotalResourceCountByUser(target)}\``,
                    `<:replycontinued:${replycontinued}> **Resources Maintained:** \`${await databaseManager.getActiveResourceCountByUser(target)}\``,
                    `<:replycontinued:${replycontinued}> **Average Resource Rating:** \`${await databaseManager.getAverageRatingByUser(target) === null ? "NULL" : Math.round((Number(await databaseManager.getAverageRatingByUser(target))) * 10) / 10}/5\``,
                    `<:reply:${reply}> **Reviews Contributed:** \`${await databaseManager.getReviewCountByUser(target)}\``,
                    ``,
                    `<a:heart:${heart}> **Support Statistics:**`,
                    `<:replycontinued:${replycontinued}> **Total Support Points:** \`${await databaseManager.getSupportPoints(target)}\``,
                    `<:reply:${reply}> **Leaderboard Position:** \`#${await databaseManager.getLeaderboardPosition(target)}/${await databaseManager.getTotalUsers()}\``,
                ].join('\n'),
            };

            await commandInteraction.createFollowup({ embeds: [embed] });
        } catch (error) {
            console.error('Error getting profile:', error);
            try {
                await commandInteraction.createFollowup({
                    content: 'Failed to get profile. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending profile error message:', followupError);
            }
        }
    }
});