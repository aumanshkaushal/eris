import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';

export default (bot: Eris.Client): Command => ({
    name: 'privatevc_move_decline',
    description: 'Decline being moved to a private voice channel',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();

        const ogMessage = await interaction.getOriginalMessage();
        const userID = ogMessage.content.match(/<@!?(\d+)>/)?.[1];
        const memberID = interaction.member?.id || interaction.user?.id!;
        if (memberID !== userID) {
            interaction.createMessage({
                content: "You are not authorized to accept this move.",
                embeds: [],
                components: [],
                flags: 64
            });
            return;
        }
        await interaction.editOriginalMessage({
            content: `<@${userID}> has declined the move request!`,
            embeds: [{
                description: `**~~Would you like to join <@${ogMessage.interaction?.user.id}>'s private voice channel?~~**`,
                color: 0xff0000
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SUCCESS,
                        label: "Accept",
                        custom_id: "privatevc_move_accept",
                        disabled: true
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.DANGER,
                        label: "Decline",
                        custom_id: "privatevc_move_decline",
                        disabled: true
                    }
                ]
            }]
        });
    }
});