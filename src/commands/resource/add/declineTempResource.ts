import Eris from 'eris';
import { Command } from '../../../types/command';
import { databaseManager } from '../../../lib/database';
import { red, blue } from '../../../secret/emoji.json'

export default (bot: Eris.Client): Command => ({
    name: 'resource_reject',
    description: 'Decline a temporary resource',
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
            const success = await databaseManager.declineTemporaryResource(resourceId, staffActionBy);

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
                    color: 0xDC143C,
                    description: interaction.message.embeds[0].description?.replace(new RegExp(`<:blue:${blue}>`, 'g'), `<:red:${red}>`) + `\n<:red:${red}> **Declined by:** <@${staffActionBy}>`
                }],
                components: updatedComponents
            });
            let resource = await databaseManager.getResource(resourceId);
            bot.users.get(resource.author)?.getDMChannel().then(dmChannel => {
                dmChannel.createMessage({
                    embeds: [{
                        description: [`Your resource \`${resource.title} (${resource.id})\` has been declined by <@${staffActionBy}>!`,
                        ].join('\n'),
                        color: 0xDC143C,
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
            

            console.log(`Resource ${resourceId} declined by ${staffActionBy}`);
        } catch (error) {
            console.error('Error declining resource:', error);
            await interaction.editOriginalMessage({
                content: '❌ An error occurred while declining the resource.',
                components: []
            });
        }
    }
});