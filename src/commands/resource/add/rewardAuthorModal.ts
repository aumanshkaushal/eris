import Eris from 'eris';
import { Command } from '../../../types/command';
import { blue, green, red } from '../../../secret/emoji.json';
import { databaseManager } from '../../../lib/database';

export default (bot: Eris.Client): Command => ({
    name: 'resource_rewardauthor_modal',
    description: 'Handle rewarding author modal submission',
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
            const resourceId = message.embeds[0]?.footer?.text
            if (!resourceId) {
                throw new Error('Invalid resource ID in modal submission');
            }

            const staffActionBy = interaction.user?.id || interaction.member?.id || '';

            const pointsComponent = interaction.data.components.find(comp => 
                comp.components[0].custom_id === 'points'
            );
            const points = pointsComponent?.components[0].value;
            const pointNum = parseInt(points || '0');

            if (isNaN(pointNum)) {
                throw new Error('Invalid points value');
            }

            const success = await databaseManager.addSupportPoints((await databaseManager.getResource(resourceId)).author, pointNum);
            if (!success) {
                throw new Error('Failed to reward author');
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

            const updatedComponents = JSON.parse(JSON.stringify(message.components));
            if (updatedComponents[0]?.components[3]?.custom_id === 'resource_rewardauthor') {
                updatedComponents[0].components[3].disabled = true;
            }
            interaction.createFollowup({
                content: `✅`
            })

            await bot.editMessage(message.channel.id, message.id, {
                embeds: [{
                    ...message.embeds[0],
                    description: [
                        message.embeds[0].description,
                        `<:${emojiName.toLowerCase()}:${emojiId}> **Reward to Author:** ${points} points awarded by <@${staffActionBy}> | \`${bot.users.get(staffActionBy)?.username}\``
                    ].join('\n'),
                }],
                components: updatedComponents
            });
            
            let resource = await databaseManager.getResource(resourceId);
            bot.users.get(resource.author)?.getDMChannel().then(dmChannel => {
                dmChannel.createMessage({
                    embeds: [{
                        description: [`Your support points were increased by \`${pointNum}\` for submitting the resource \`${resource.title} (${resource.id})\`!`,
                        ].join('\n'),
                        color: 0xADD8E6,
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
            

        } catch (error) {
            console.error('Error processing modal submission:', error);
            await interaction.createMessage({
                content: `❌ An error occurred while rewarding user: ${(error as Error).message}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    }
});