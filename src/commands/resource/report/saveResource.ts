import Eris from 'eris';
import { Command } from '../../../types/command';
import { cache } from '../../../lib/cache';
import { blue, red, green } from '../../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'report_resource_save',
    description: 'Save a resource',
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
            if (updatedComponents[0]?.components[2]?.custom_id === 'report_resource_delete') {
                updatedComponents[0].components[2].disabled = true;
            }
            if (updatedComponents[0]?.components[3]?.custom_id === 'report_resource_save') {
                updatedComponents[0].components[3].disabled = true;
            }
            if (updatedComponents[1]?.components[0]?.custom_id === 'report_resource_edit') {
                updatedComponents[1].components[0].disabled = true;
            }
            const resource = await cache.getResource(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            const staffActionBy = interaction.user?.id || interaction.member?.id || '';
            await cache.deleteResource(resourceId, staffActionBy);

            await interaction.editOriginalMessage({
                embeds: [{
                    ...interaction.message.embeds[0],
                    color: 0x80EF80,
                    description: [`${interaction.message.embeds[0].description?.replace(new RegExp(`<:blue:${blue}>`, 'g'), `<:green:${green}>`)}`,
                    `<:green:${green}> **Resource Saved By:** <@${staffActionBy}> | \`${bot.users.get(staffActionBy)?.username}\``].join('\n'),
                }],
                components: updatedComponents
            });

        } catch (error) {
            console.error('Error saving resource:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while saving resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});