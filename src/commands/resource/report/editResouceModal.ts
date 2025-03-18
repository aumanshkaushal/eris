import Eris from 'eris';
import { Command } from '../../../types/command';
import { blue, green, red } from '../../../secret/emoji.json';
import { databaseManager } from '../../../lib/database';

export default (bot: Eris.Client): Command => ({
    name: 'report_resource_edit_modal',
    description: 'Handle editing reported resource modal submission',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ModalSubmitInteraction)) return;

        try {
            await interaction.defer(Eris.Constants.MessageFlags.EPHEMERAL);
            const message = await bot.getMessage(
                (await interaction.getOriginalMessage()).messageReference?.channelID!,
                (await interaction.getOriginalMessage()).messageReference?.messageID!
            );

            const resourceId = message.embeds[0]?.footer?.text.split('#')[0];
            if (!resourceId) {
                throw new Error('Invalid resource ID in modal submission');
            }


            const resource = await databaseManager.getResource(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            const staffActionBy = interaction.user?.id || interaction.member?.id || '';
            const editType = (interaction.data.components[0] as any).components[0].custom_id;
            let newValue = (interaction.data.components[0] as any).components[0].value;

            let success: boolean;
            switch (editType) {
                case 'edit_title':
                    success = await databaseManager.editTitle(resourceId, newValue, staffActionBy);
                    break;
                case 'edit_tag':
                    success = await databaseManager.editTag(resourceId, newValue, staffActionBy);
                    break;
                case 'edit_description':
                    success = await databaseManager.editDescription(resourceId, newValue, staffActionBy);
                    if (newValue == 'none') {
                        newValue = '';
                    }
                    break;
                case 'edit_url':
                    success = await databaseManager.editUrl(resourceId, newValue, staffActionBy);
                    break;
                case 'edit_author':
                    let authorID = bot.users.get(newValue)?.id
                    if (!authorID) {
                        throw new Error('Invalid author ID');
                    }
                    newValue = authorID;
                    success = await databaseManager.editAuthor(resourceId, newValue, staffActionBy);
                    break;
                default:
                    throw new Error('Invalid edit type');
            }

            if (!success) {
                throw new Error(`Failed to update resource ${editType}`);
            }

            const embedColor = message.embeds[0]?.color;
            let emojiId: string;
            let emojiName: string;

            switch (embedColor) {
                case 0x80EF80:
                    emojiId = green;
                    emojiName = 'green';
                    break;
                case 0xADD8E6:
                    emojiId = blue;
                    emojiName = 'blue';
                    break;
                case 0xDC143C:
                    emojiId = red;
                    emojiName = 'red';
                    break;
                default:
                    emojiId = blue;
                    emojiName = 'blue';
                    break;
            }

            await bot.editMessage(message.channel.id, message.id, {
                embeds: [{
                    ...message.embeds[0],
                    description: [
                        message.embeds[0].description,
                        `<:${emojiName.toLowerCase()}:${emojiId}> **Resource Edited:** ${editType.replace('edit_', '').toUpperCase()} updated to \`${newValue}\` by <@${staffActionBy}> | \`${bot.users.get(staffActionBy)?.username}\``
                    ].join('\n'),
                }],
                components: message.components
            });

            await interaction.createFollowup({
                content: `✅`
            })
        } catch (error) {
            console.error('Error processing modal submission:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while editing resource: ${(error as Error).message}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});