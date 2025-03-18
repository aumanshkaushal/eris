import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';

export default (bot: Eris.Client): Command => ({
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ModalSubmitInteraction)) {
            return;
        }

        const modalInteraction = interaction as Eris.ModalSubmitInteraction;

        try {
            const customIdParts = modalInteraction.data.custom_id.split('_');
            console.log(customIdParts)
            if (customIdParts[0] !== 'rewardusermodal' || customIdParts.length < 2) {
                return;
            }
            const targetUserId = customIdParts[1];

            const pointsInput = modalInteraction.data.components[0].components[0] as Eris.ModalSubmitInteractionDataComponent;
            const points = parseInt(pointsInput.value, 10);

            if (isNaN(points) || points <= 0) {
                await modalInteraction.createMessage({
                    content: 'Please enter a valid positive number of support points!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            if (!modalInteraction.member?.roles.includes('1143906181182664814') && modalInteraction.member?.user.id !== '428191892950220800') {
                await modalInteraction.createMessage({
                    content: 'You do not have the required role to reward users!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }
            await databaseManager.addSupportPoints(targetUserId, points);
            let userPoints = await databaseManager.getSupportPoints(targetUserId);
            await modalInteraction.createMessage({
                content: `Successfully rewarded <@${targetUserId}> with ${points} support point(s)! They now have ${userPoints} points.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });

        } catch (error) {
            console.error('Error processing reward user modal:', error);
            try {
                await modalInteraction.createMessage({
                    content: 'Failed to process the reward. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                console.log('Sent error followup message');
            } catch (followupError) {
                console.error('Error sending followup message:', followupError);
            }
        }
    }
});