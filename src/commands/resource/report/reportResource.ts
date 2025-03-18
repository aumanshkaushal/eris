import Eris from 'eris';
import { Command } from '../../../types/command';
import { databaseManager } from '../../../lib/database';
import { resourceReportChannelID } from '../../../secret/config.json'
import { blue, stars, heart, wrong, right, red } from '../../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'resource_report',
    description: 'Rate a resource',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || 
            interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;

        const resourceId = interaction.message.embeds[0]?.footer?.text || '';
        const reporter = interaction.user?.id || interaction.member?.id || '';

        try {
            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }

            let resource = await databaseManager.getResource(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }
            if (resource.status !== 'active') {
                await interaction.createMessage({
                    embeds: [{
                        color: 0xDC143C,
                        description: `<:red:${red}> **Resource ID:** \`${resourceId}\` is not active and cannot be reported!`,}],
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                })
                return;
            }

                

            await interaction.createMessage({
                embeds: [{
                    color: 0xADD8E6,
                    description: `<:blue:${blue}> **Resource ID:** \`${resourceId}\` has been reported to the staff!
                    > Please wait for the staff to review the resource.`,
                }],
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            })



            bot.createMessage(resourceReportChannelID, {
                embeds: [{
                    title: `Resource Report - ${resourceId}`,
                    description: [`<:blue:${blue}> **Resource Title:** \`${resource.title}\``,
                        `<:blue:${blue}> **Resource Tag:** \`${resource.tag}\``,
                        `<:blue:${blue}> **Resource Author:** <@${resource.author}> | \`${bot.users.get(resource.author)?.username}\``,
                        `<:blue:${blue}> **Resource URL:** [Click Here](${resource.url}) | \`${resource.url}\``,
                        resource.description ? `<:blue:${blue}> **Resource Description:** \`${resource.description}\`` : '',
                        `<:blue:${blue}> **Reported by:** <@${reporter}> | \`${bot.users.get(reporter)?.username}\``]
                        .filter(line => line !== '')
                        .join('\n'),
                    color: 0xADD8E6,
                    footer: {
                        text: `${resourceId}#${reporter}`,
                        icon_url: interaction.guildID ? bot.guilds.get(interaction.guildID)?.iconURL ?? undefined : undefined
                    }
                }],
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [{
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.LINK,
                        label: 'Visit',
                        url: resource.url
                    },{
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.PRIMARY,
                        label: 'Notify Author',
                        custom_id: 'report_notify_author',
                        emoji: {
                            id: stars,
                            name: 'stars',
                            animated: true
                        }
                    },{
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SUCCESS,
                        label: 'Save Resource',
                        custom_id: 'report_resource_save',
                        emoji: {
                            id: right,
                            name: 'right',
                            animated: true
                        }
                    },{
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.DANGER,
                        label: 'Delete Resource',
                        custom_id: 'report_resource_delete',
                        emoji: {
                            id: wrong,
                            name: 'wrong',
                            animated: true
                        }
                    },{
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Reward Reporter',
                        custom_id: 'report_reward_reporter',
                        emoji: {
                            id: heart,
                            name: 'heart',
                            animated: true
                        }
                    }]
                },{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [{
                        type: Eris.Constants.ComponentTypes.SELECT_MENU,
                        custom_id: 'report_resource_edit',
                        placeholder: 'Edit Resource',
                        options: [{
                            label: 'Edit Title',
                            value: 'edit_title'
                        },{
                            label: 'Edit Tag',
                            value: 'edit_tag'
                        },{
                            label: 'Edit Description',
                            value: 'edit_description'
                        },{
                            label: 'Edit URL',
                            value: 'edit_url'
                        },{
                            label: 'Edit Author',
                            value: 'edit_author'
                        }],
                        min_values: 1,
                        max_values: 1                    
                }]
                }]
            });

        } catch (error) {
            console.error('Error reporting resource:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while reporting the resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});