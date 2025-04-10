import Eris from 'eris';
import { Command } from '../../types/command';
import fetch from 'node-fetch';
import { guildID } from '../../secret/config.json';
const staffRoleIDs: string[] = require('../../secret/config.json').staffRoleIDs;
import roles from '../../secret/roles.json'
import { databaseManager } from '../../lib/database';
import { red, blue } from '../../secret/emoji.json'

export default (bot: Eris.Client): Command => ({
    name: 'doubt_delete',
    description: 'Delete your doubt from the database',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();

        try {
            let doubtId = interaction.message.embeds[0]?.footer?.text || '';
            let doubt = await databaseManager.getDoubtById(doubtId);

            if (!doubt) {
                throw new Error('Doubt not found in the database');
            }

                const hasPermission = (interaction.member?.roles as string[]).some(role => staffRoleIDs.includes(role));
                if (interaction.member?.id !== doubt.author && !hasPermission) {
                    await interaction.createMessage({
                        content: `❌ You can't delete this doubt!`,
                        flags: Eris.Constants.MessageFlags.EPHEMERAL,
                    });
                    return;
                }

            await databaseManager.deleteDoubt(doubtId);
            const updatedComponents = JSON.parse(JSON.stringify(interaction.message.components));
            
            updatedComponents[0]?.components.forEach((component: any) => {
                if (['doubt_rotate_anticlockwise', 'doubt_rotate_clockwise', 'doubt_ai', 'doubt_delete', 'doubt_edit'].includes(component.custom_id)) {
                    component.disabled = true;
                }
            });
            await interaction.editOriginalMessage({
                embeds: [{                    
                    ...interaction.message.embeds[0],
                    description: [
                        interaction.message.embeds[0].description,
                        `<:red:${red}> **Deleted by:** <@${interaction.member?.id || interaction.user!.id}>`,
                    ].join('\n').replace(new RegExp(`<:blue:${blue}>`, 'g'), `<:red:${red}>`),
                    color: 0xDC143C,
                }],
                components: updatedComponents
            })

        } catch (error) {
            console.error('Error getting AI Response:', error);
            await interaction.editOriginalMessage({
                content: '❌ An error occurred while getting AI response.',
                components: []
            });
        }
    }
});