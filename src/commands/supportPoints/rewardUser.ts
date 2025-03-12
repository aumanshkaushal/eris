import Eris from 'eris';
import { Command } from '../../types/command';

export default (bot: Eris.Client): Command => ({
    name: 'Reward User',
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
            const custom_id = `rewardusermodal_${targetId}`;

            await interaction.createModal({
                title: 'Reward User',
                custom_id,
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [{
                        custom_id: 'points',
                        label: 'How many support points do you want to award?',
                        style: Eris.Constants.TextInputStyles.SHORT,
                        type: Eris.Constants.ComponentTypes.TEXT_INPUT
                    }]
                }]
            });

        } catch (error) {
            console.error('Error rewarding user:', error);
            try {
                await interaction.createMessage({
                    content: 'Failed to reward user. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error rewarding user error message:', followupError);
            }
        }
    }
});