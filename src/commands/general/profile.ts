import Eris from 'eris';
import { Command } from '../../types/command';
import { cache } from '../../lib/cache';
import { stars, heart, reply, replycontinued } from '../../secret/emoji.json';
import { getSupportPoints } from '../../lib/supportPoints/getSupportPoints';

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
    } as Eris.ApplicationCommandOptions
    ],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.APPLICATION_COMMAND) return;

        const commandInteraction = interaction as Eris.CommandInteraction;

        try {
            await commandInteraction.defer();

            let target = (commandInteraction.data.options?.find(option => option.name === 'user') as Eris.InteractionDataOptionsUser)?.value;
            if (!target) {
                target = commandInteraction.user?.id || commandInteraction.member?.id ||'';
            }

            commandInteraction.createFollowup({
                embeds: [{
                    color: 0xFFFFFF,
                    image: {
                        url: "https://cdn.discordapp.com/attachments/948989141562040370/1117037169840750682/1686392804883.jpg"
                    },
                    author: {
                        name: bot.users.get(target)?.username || 'User not found',
                        icon_url: bot.users.get(target)?.avatarURL || ''
                    },
                    description: [
                        `<a:heart:${heart}> **Created account on:**`,
                        `<:reply:${reply}> <t:${Math.round(new Date(bot.users.get(target)?.createdAt || 0).valueOf()/1000)}:F> (<t:${Math.round(new Date(bot.users.get(target)?.createdAt || 0).valueOf()/1000)}:R>)`,
                        ``,
                        `<a:heart:${heart}> **Joined server on:**`,
                        `<:reply:${reply}> ${commandInteraction.member?.joinedAt ? `<t:${Math.round(new Date(commandInteraction.member.joinedAt).valueOf()/1000)}:F> (<t:${Math.round(new Date(commandInteraction.member.joinedAt).valueOf()/1000)}:R>)` : 'Not in server'}`,
                        ``,
                        `<a:heart:${heart}> **Resource Statistics:**`,                        
                        `<:replycontinued:${replycontinued}> **Resources Submitted:** \`${await cache.getTotalResourceCountByUser(target)}\``,
                        `<:replycontinued:${replycontinued}> **Resources Maintained:** \`${await cache.getActiveResourceCountByUser(target)}\``,
                        `<:replycontinued:${replycontinued}> **Average Resource Rating:** \`${await cache.getAverageRatingByUser(target) === null? "NULL" : await cache.getAverageRatingByUser(target)}/5\``,
                        `<:reply:${reply}> **Reviews Contributed:** \`${await cache.getReviewCountByUser(target)}\``,
                        ``,
                        `<a:heart:${heart}> **Support Statistics:**`,
                        `<:reply:${reply}> **Total Support Points:** \`${await getSupportPoints(target)}\``,

                    ].join('\n'),
                }]
            })
            

        } catch (error) {
            console.error('Error getting profile:', error);
            try {
                await commandInteraction.createFollowup({
                    content: 'Failed to get profile. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error getting profile error message:', followupError);
            }
        }
    }
});