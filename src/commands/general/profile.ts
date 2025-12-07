import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { winterTheme } from '../../secret/config.json';
import emoji from '../../secret/emoji.json';
import fs from 'fs';

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

            let target = (commandInteraction.data.options?.find(option => option.name === 'user') as Eris.InteractionDataOptionsUser)?.value;
            if (!target) {
                target = commandInteraction.user?.id || commandInteraction.member?.id || '';
            }

            const user = bot.users.get(target);
            if (!user) {
                await commandInteraction.createFollowup({
                    content: `${winterTheme? `<a:pink_butterfly:${emoji.pink_butterfly}>` : `❌`} User not found.`,
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            const guild = bot.guilds.get(commandInteraction.guildID ?? '');
            let member: Eris.Member | undefined;
            if (guild) {
                member = guild.members.get(target);
                if (!member) {
                    try {
                        const members = await guild.fetchMembers({ userIDs: [target], limit: 1 });
                        member = members[0];
                    } catch (fetchError) {
                        console.warn(`Failed to fetch member ${target} from guild ${guild.id}:`, fetchError);
                    }
                }
            }

            const createdAtTimestamp = user.createdAt ?? Date.now();
            const createdAtSeconds = Math.round(createdAtTimestamp / 1000);

            const joinedAtTimestamp = member?.joinedAt;
            const joinedAtText = joinedAtTimestamp
                ? `<t:${Math.round(joinedAtTimestamp / 1000)}:F> (<t:${Math.round(joinedAtTimestamp / 1000)}:R>)`
                : 'Not in server';
            const pronouns = await databaseManager.getUserPronouns(target) || 'N/A';
            const embed: Eris.EmbedOptions = {
                color: winterTheme ? 0x97c1e6 : 0xffffff,
                image: {
                    url: "attachment://cbseCommunityBanner.jpg"
                },
                author: {
                    name: user.username || 'User not found',
                    icon_url: user.avatarURL || ''
                },
                description: [
                    `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Created account on:**`,
                    `<:reply:${emoji.reply}> <t:${createdAtSeconds}:F> (<t:${createdAtSeconds}:R>)`,
                    ``,
                    `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Joined server on:**`,
                    `<:reply:${emoji.reply}> ${joinedAtText}`,
                    ``,
                    `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Pronouns:**`,
                    `<:reply:${emoji.reply}> \`${pronouns}\``,
                    ``,
                    `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Resource Statistics:**`,                        
                    `<:replycontinued:${emoji.replycontinued}> **Resources Submitted:** \`${await databaseManager.getTotalResourceCountByUser(target)}\``,
                    `<:replycontinued:${emoji.replycontinued}> **Resources Maintained:** \`${await databaseManager.getActiveResourceCountByUser(target)}\``,
                    `<:replycontinued:${emoji.replycontinued}> **Average Resource Rating:** \`${await databaseManager.getAverageRatingByUser(target) === null ? "NULL" : Math.round((Number(await databaseManager.getAverageRatingByUser(target))) * 10) / 10}/5\``,
                    `<:reply:${emoji.reply}> **Reviews Contributed:** \`${await databaseManager.getReviewCountByUser(target)}\``,
                    ``,
                    `${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Support Statistics:**`,
                    `<:replycontinued:${emoji.replycontinued}> **Total Support Points:** \`${await databaseManager.getSupportPoints(target)}\``,
                    `<:reply:${emoji.reply}> **Leaderboard Position:** \`#${await databaseManager.getLeaderboardPosition(target)}/${await databaseManager.getTotalUsers()}\``,
                ].join('\n'),
            };

            await commandInteraction.createFollowup({ embeds: [embed] }, {
                file: fs.readFileSync(winterTheme? './assets/cbseCommunityXmasBanner.jpg' : './assets/cbseCommunityBanner.jpg'),
                name: 'cbseCommunityBanner.jpg'
            });
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