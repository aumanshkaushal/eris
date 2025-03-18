import Eris from 'eris';
import { Command } from '../../../types/command';
import { databaseManager } from '../../../lib/database';
import { blue } from '../../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'report_notify_author',
    description: 'Rate a resource',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || 
            interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();

        const resourceId = interaction.message.embeds[0]?.footer?.text.split('#')[0] || '';

        try {
            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }

            const updatedComponents = JSON.parse(JSON.stringify(interaction.message.components));
            
            if (updatedComponents[0]?.components[1]?.custom_id === 'report_notify_author') {
                updatedComponents[0].components[1].disabled = true;
            }
            const resource = await databaseManager.getResource(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }
            const author = resource.author;

            bot.users.get(author)?.getDMChannel().then(async dmChannel => {
                await dmChannel.createMessage({
                    embeds: [{
                        color: 0xADD8E6,
                        description: [
                            `Resource ID #${resourceId} has recieved a **report** about being inaccessible. You are requested to review it and post an update about it in <#948219858447921157> and ping staff!\n`,
                            `> **__For reference:__**`,
                            `> **Resource ID:** \`${resourceId}\``,
                            `> **Resource Title:** \`${resource.title}\``,
                            `> **Resource Tag:** \`${resource.tag}\``,
                            `> **Resource URL:** [Click Here](${resource.url}) | \`${resource.url}\``,
                            `${resource.description ? `> Resource Description: \`${resource.description}\`` : ''}`
                        ].filter(line => line !== '').join('\n'),

                    }],
                    components: [{
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [{
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.LINK,
                            label: 'Visit Resource',
                            url: resource.url
                        }]
                    }]
                });
            }
            ).catch(() => {
                console.error(`Failed to send DM to author ${author}`);
            });
            const timestamp = Math.floor(Date.now() / 1000);

            await interaction.editOriginalMessage({
                embeds: [{
                    ...interaction.message.embeds[0],
                    color: 0xADD8E6,
                    description: [`${interaction.message.embeds[0].description}`,
                    `<:blue:${blue}> **Notified author on:** <t:${timestamp}:F> (<t:${timestamp}:R>)`].join('\n'),
                }],
                components: updatedComponents
            });

        } catch (error) {
            console.error('Error notifying author of the resource:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while notifying author of the resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});