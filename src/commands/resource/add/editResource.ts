import Eris from 'eris';
import { Command } from '../../../types/command';

export default (bot: Eris.Client): Command => ({
    name: 'resource_edit',
    description: 'Handle resource edit select menu',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || 
            interaction.data.component_type !== Eris.Constants.ComponentTypes.SELECT_MENU || 
            interaction.data.custom_id !== 'resource_edit') return;

        try {
            const resourceId = interaction.message.embeds[0]?.footer?.text
            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }
            const selectedOption = interaction.data.values[0];

            let modalTitle: string;
            let inputLabel: string;
            let inputPlaceholder: string;

            switch (selectedOption) {
                case 'edit_title':
                    modalTitle = 'Edit Resource Title';
                    inputLabel = 'New Title';
                    inputPlaceholder = 'Enter the new resource title';
                    break;
                case 'edit_tag':
                    modalTitle = 'Edit Resource Tag';
                    inputLabel = 'New Tag';
                    inputPlaceholder = 'Enter the new resource tag';
                    break;
                case 'edit_description':
                    modalTitle = 'Edit Resource Description';
                    inputLabel = 'New Description';
                    inputPlaceholder = 'Enter the new resource description';
                    break;
                case 'edit_url':
                    modalTitle = 'Edit Resource URL';
                    inputLabel = 'New URL';
                    inputPlaceholder = 'Enter the new resource URL';
                    break;
                case 'edit_author':
                    modalTitle = 'Edit Resource Author';
                    inputLabel = 'New Author ID';
                    inputPlaceholder = "Enter the new author's ID or username";
                    break;
                default:
                    throw new Error('Invalid edit option selected');
            }

            await interaction.createModal({
                title: modalTitle,
                custom_id: `resource_edit_modal`,
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [{
                        type: Eris.Constants.ComponentTypes.TEXT_INPUT,
                        custom_id: selectedOption,
                        label: inputLabel,
                        style: Eris.Constants.TextInputStyles.SHORT,
                        required: true,
                        placeholder: inputPlaceholder
                    }]
                }]
            });

        } catch (error) {
            console.error('Error handling resource edit select menu:', error);
            await interaction.createMessage({
                content: `❌ An error occurred: ${(error as Error).message}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});