import Eris from 'eris';
import { Command } from '../../../types/command';
import { databaseManager } from '../../../lib/database';
import { blue } from '../../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'report_reward_reporter',
    description: 'Rate a resource',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || 
            interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;

        const resourceId = interaction.message.embeds[0]?.footer?.text.split('#')[0] || '';
        try {
            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }

            const updatedComponents = JSON.parse(JSON.stringify(interaction.message.components));
            
            if (updatedComponents[0]?.components[4]?.custom_id === 'report_reward_reporter') {
                updatedComponents[0].components[4].disabled = true;
            }

            await interaction.createModal({
                title: 'Reward Reporter',
                custom_id: `report_reward_reporter_modal`,
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
            console.error('Error notifying author of the resource:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while notifying author of the resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});