import Eris from 'eris';
import { Command } from '../../types/command';
import { developerID } from '../../secret/config.json';
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
            if (customIdParts[0] !== 'modifysupportpointsmodal' || customIdParts.length < 2) {
                return;
            }
            const targetUserId = customIdParts[1];

            const pointsInput = modalInteraction.data.components[0].components[0] as Eris.ModalSubmitInteractionDataComponent;
            const points = parseInt(pointsInput.value, 10);

            if (!modalInteraction.member?.roles.includes('1143906181182664814') && modalInteraction.member?.user.id !== developerID) {
                await modalInteraction.createMessage({
                    content: 'You do not have the required role to reward users!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }
            await databaseManager.addSupportPoints(targetUserId, points);
            let userPoints = await databaseManager.getSupportPoints(targetUserId);
            await modalInteraction.createMessage({
                content: `Successfully ${(points>0) ? 'rewarded' : 'deducted'} ${Math.abs(points)} support point(s) to <@${targetUserId}>! They now have ${userPoints} points.`
            });

            bot.users.get(targetUserId)?.getDMChannel().then((dmChannel) => {
                dmChannel.createMessage({
                    content: `You now have \`\`${userPoints}\`\` points. ${(points > 0) ? `You've been rewarded with ${points} point(s)!` : `You've had ${Math.abs(points)} point(s) deducted.`}`
                });
            });

        } catch (error) {
            console.error('Error processing modify user modal:', error);
            try {
                await modalInteraction.createMessage({
                    content: 'Failed to process the modification. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                console.log('Sent error followup message');
            } catch (followupError) {
                console.error('Error sending followup message:', followupError);
            }
        }
    }
});