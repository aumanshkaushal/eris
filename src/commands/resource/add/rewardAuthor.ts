import Eris from 'eris';
import { Command } from '../../../types/command';

export default (bot: Eris.Client): Command => ({
    name: 'resource_rewardauthor',
    description: 'Reward the author of a resource',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || 
            interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;

        const resourceId = interaction.message.embeds[0]?.footer?.text
        try {
            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }

            const updatedComponents = JSON.parse(JSON.stringify(interaction.message.components));
            
            if (updatedComponents[0]?.components[4]?.custom_id === 'resource_rewardauthor') {
                updatedComponents[0].components[4].disabled = true;
            }

            await interaction.createModal({
                title: 'Reward Author',
                custom_id: `resource_rewardauthor_modal`,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Eris.Constants.ComponentTypes.TEXT_INPUT,
                                custom_id: 'points',
                                label: 'Support Points',
                                style: Eris.Constants.TextInputStyles.SHORT,
                                min_length: 1,
                                max_length: 2,
                                required: true,
                                placeholder: 'How many points to award?'
                            }
                        ]
                    }
                ]
            });


        } catch (error) {
            console.error('Error rewarding author of the resource:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while rewarding author of the resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});