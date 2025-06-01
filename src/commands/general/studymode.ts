import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { blue, red } from '../../secret/emoji.json';
import { studymode } from '../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'studymode',
    description: 'Turn on/off study mode to focus on your studies',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.CommandInteraction)) {
            return;
        }

        try {
            const commandInteraction = interaction as Eris.CommandInteraction;
            const userID = commandInteraction.user?.id || commandInteraction.member?.user.id || '';
            await interaction.defer();

            const roles = commandInteraction.member?.roles || [];
            if (roles.includes(studymode)) {
                if (await databaseManager.isStudyModeLocked(userID)) {
                    await interaction.createMessage({
                        content: `<:red:${red}> You are locked! You cannot exit study mode until the lock is removed.`,
                        flags: Eris.Constants.MessageFlags.EPHEMERAL
                    });
                    return;
                }
                await commandInteraction.member?.removeRole(studymode);
                await interaction.createMessage({
                    content: `<:blue:${blue}> You have exited study mode!`
                });
                return;
            }
            else {
                await commandInteraction.member?.addRole(studymode);
                await interaction.createMessage({
                    content: `<:blue:${blue}> You have entered study mode!`
                });
                return;
            }

        } catch (error) {
            console.error('Error processing /studymode command:', error);
            try {
                await interaction.createMessage({
                    content: 'Failed to put user to studymode. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending followup message:', followupError);
            }
        }
    }
});