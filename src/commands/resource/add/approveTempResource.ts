import Eris from 'eris';
import { Command } from '../../../types/command';
import { databaseManager } from '../../../lib/database';
import { green, blue } from '../../../secret/emoji.json'

export default (bot: Eris.Client): Command => ({
    name: 'resource_approve',
    description: 'Approve a temporary resource',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();

        try {
            const resourceId = interaction.message.embeds[0]?.footer?.text;
            if (!resourceId) {
                throw new Error('No resource ID found in message');
            }

            const staffActionBy = interaction.member?.id || interaction.user!.id;
            const success = await databaseManager.approveTemporaryResource(resourceId, staffActionBy);

            if (!success) {
                await interaction.editOriginalMessage({
                    content: '❌ Resource not found!',
                    components: []
                });
                return;
            }
            
            const updatedComponents = JSON.parse(JSON.stringify(interaction.message.components));
            
            if (updatedComponents[0]?.components[1]?.custom_id === 'resource_approve') {
                updatedComponents[0].components[1].disabled = true;
            }
            if (updatedComponents[0]?.components[2]?.custom_id === 'resource_reject') {
                updatedComponents[0].components[2].disabled = true;
            }
            if (updatedComponents[1]?.components[0]?.custom_id === 'resource_edit') {
                updatedComponents[1].components[0].disabled = true;
            }

            await interaction.editOriginalMessage({
                embeds: [{
                    ...interaction.message.embeds[0],
                    color: 0x80EF80,
                    description: interaction.message.embeds[0].description?.replace(new RegExp(`<:blue:${blue}>`, 'g'), `<:green:${green}>`) + `\n<:green:${green}> **Approved by:** <@${staffActionBy}>`
                }],
                components: updatedComponents
            });
            let resource = await databaseManager.getResource(resourceId);
            bot.users.get(resource.author)?.getDMChannel().then(dmChannel => {
                dmChannel.createMessage({
                    embeds: [{
                        description: [`Your resource \`${resource.title} (${resource.id})\` has been approved by <@${staffActionBy}>!`,
                        ].join('\n'),
                        color: 0x80EF80,
                    }],
                    components: [{
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Eris.Constants.ComponentTypes.BUTTON,
                                style: Eris.Constants.ButtonStyles.LINK,
                                label: 'View Resource',
                                url: resource.url
                            }
                        ]
                    }]
                });
            });

            console.log(`Resource ${resourceId} approved by ${staffActionBy}`);
        } catch (error) {
            console.error('Error approving resource:', error);
            await interaction.editOriginalMessage({
                content: '❌ An error occurred while approving the resource.',
                components: []
            });
        }
    }
});