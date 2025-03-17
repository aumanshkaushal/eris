import Eris from 'eris';
import { Command } from '../../types/command';
import { cache } from '../../lib/cache';
export default (bot: Eris.Client): Command => ({
    name: 'resource_rate',
    description: 'Rate a resource',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || 
            interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;

        const resourceId = interaction.message.embeds[0]?.footer?.text || '';
        const reviewer = interaction.user?.id || interaction.member?.id || '';

        try {
            if (await cache.hasRated(resourceId, reviewer)) {
                await interaction.createMessage({
                    content: '❌ You have already rated this resource.',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }

            await interaction.createModal({
                title: 'Rate Resource',
                custom_id: `resource_rate_modal`,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Eris.Constants.ComponentTypes.TEXT_INPUT,
                                custom_id: 'rating',
                                label: 'Rating (1-5)',
                                style: Eris.Constants.TextInputStyles.SHORT,
                                min_length: 1,
                                max_length: 1,
                                required: true,
                                placeholder: 'Enter a number from 1 to 5'
                            }
                        ]
                    },
                    {
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Eris.Constants.ComponentTypes.TEXT_INPUT,
                                custom_id: 'comment',
                                label: 'Comment (optional)',
                                style: Eris.Constants.TextInputStyles.PARAGRAPH,
                                max_length: 1000,
                                required: false,
                                placeholder: 'Enter your feedback about the resource'
                            }
                        ]
                    }
                ]
            });

        } catch (error) {
            console.error('Error rating resource:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while rating the resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});