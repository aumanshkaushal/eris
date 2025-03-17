import Eris from 'eris';
import { Command } from '../../types/command';
import { cache } from '../../lib/cache';
import { blue } from '../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'resource_rate_modal',
    description: 'Handle resource rating modal submission',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ModalSubmitInteraction)) return;

        try {
            await interaction.defer(Eris.Constants.MessageFlags.EPHEMERAL);
            const resourceId = (await (bot.getMessage((await interaction.getOriginalMessage()).messageReference?.channelID!, (await interaction.getOriginalMessage()).messageReference?.messageID!))).embeds[0]?.footer?.text;
            if (!resourceId) {
                throw new Error('Invalid resource ID in modal submission');
            }

            const reviewerId = interaction.user?.id || interaction.member?.id;
            if (!reviewerId) {
                throw new Error('Invalid reviewer ID in modal submission');
            }

            const ratingComponent = interaction.data.components.find(comp => 
                comp.components[0].custom_id === 'rating'
            );
            const commentComponent = interaction.data.components.find(comp => 
                comp.components[0].custom_id === 'comment'
            );

            const rating = ratingComponent?.components[0].value;
            const comment = commentComponent?.components[0].value || 'No comment provided';

            const ratingNum = parseInt(rating || '0');
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                throw new Error('Invalid rating value');
            }

            const success = await cache.rateResource(resourceId, reviewerId, ratingNum, comment);
            if (!success) {
                throw new Error('Failed to save rating');
            }

            await interaction.createMessage({
                embeds: [{
                    description: `<:blue:${blue}> Thank you for submitting your rating for resource \`${resourceId}\`!`,
                    color: 0xADD8E6
                }],
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });

        } catch (error) {
            console.error('Error processing modal submission:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while submitting your rating: ${(error as Error).message}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});