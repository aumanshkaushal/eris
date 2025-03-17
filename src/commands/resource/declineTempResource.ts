import Eris from 'eris';
import { Command } from '../../types/command';
import { declineTemporaryResource } from '../../lib/resource/declineTemporaryResource';
import { red, blue } from '../../secret/emoji.json'

export default (bot: Eris.Client): Command => ({
    name: 'resource_reject',
    description: 'Decline a temporary resource',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();

        try {
            const resourceId = interaction.message.embeds[0]?.footer?.text;
            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }

            const staffActionBy = interaction.member?.id || interaction.user!.id;
            const success = await declineTemporaryResource(resourceId, staffActionBy);

            if (!success) {
                await interaction.editOriginalMessage({
                    content: '❌ Resource not found!',
                    components: []
                });
                return;
            }

            await interaction.editOriginalMessage({
                embeds: [{
                    ...interaction.message.embeds[0],
                    color: 0xFF0000,
                    description: interaction.message.embeds[0].description?.replace(new RegExp(`<:blue:${blue}>`, 'g'), `<:red:${red}>`) + `\n<:red:${red}> **Declined by:** <@${staffActionBy}>`
                }],
                components: interaction.message.components
            });

            console.log(`Resource ${resourceId} declined by ${staffActionBy}`);
        } catch (error) {
            console.error('Error declining resource:', error);
            await interaction.editOriginalMessage({
                content: '❌ An error occurred while declining the resource.',
                components: []
            });
        }
    }
});