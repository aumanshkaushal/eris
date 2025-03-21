import Eris from 'eris';
import { Command } from '../../types/command';

export default (bot: Eris.Client): Command => ({
    name: 'Modify Support Points',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.USER,
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.CommandInteraction)) {
            return;
        }

        try {
            if (!interaction.member?.roles.includes('1143906181182664814') && interaction.member?.user.id !== '428191892950220800') {
                await interaction.createMessage({
                    content: 'You do not have the required role to reward users!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            const targetId = interaction.data.target_id;
            const custom_id = `modifysupportpointsmodal_${targetId}`;

            await interaction.createModal({
                title: 'Modify Support Points',
                custom_id,
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [{
                        custom_id: 'points',
                        label: 'Number of points to add (+) or deduct (-)',
                        placeholder: '(e.g., +1 or -1)',
                        style: Eris.Constants.TextInputStyles.SHORT,
                        type: Eris.Constants.ComponentTypes.TEXT_INPUT
                    }]
                }]
            });

        } catch (error) {
            console.error('Error modifying support points of the user:', error);
            try {
                await interaction.createMessage({
                    content: 'Failed to modify support points of the user. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error modifying support points of the user error message:', followupError);
            }
        }
    }
});