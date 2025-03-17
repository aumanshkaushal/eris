import Eris from 'eris';
import { Command } from '../../../types/command';
import { blue, green, red } from '../../../secret/emoji.json';
import { addSupportPoints } from '../../../lib/supportPoints/addSupportPoints';

export default (bot: Eris.Client): Command => ({
    name: 'report_reward_reporter_modal',
    description: 'Handle rewarding reporter modal submission',
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
            const reporter = message.embeds[0]?.footer?.text.split('#')[1] || '';
            if (!resourceId) {
                throw new Error('Invalid resource ID in modal submission');
            }

            const staffActionBy = interaction.user?.id || interaction.member?.id || '';

            const pointsComponent = interaction.data.components.find(comp => 
                comp.components[0].custom_id === 'points'
            );
            const points = pointsComponent?.components[0].value;
            const pointNum = parseInt(points || '0');
            console.log(pointNum)

            if (isNaN(pointNum)) {
                throw new Error('Invalid points value');
            }

            const success = await addSupportPoints(reporter, pointNum);
            if (!success) {
                throw new Error('Failed to reward reporter');
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
            if (updatedComponents[0]?.components[4]?.custom_id === 'report_reward_reporter') {
                updatedComponents[0].components[4].disabled = true;
            }
            interaction.createFollowup({
                content: `✅`
            })

            await bot.editMessage(message.channel.id, message.id, {
                embeds: [{
                    ...message.embeds[0],
                    description: [
                        message.embeds[0].description,
                        `<:${emojiName.toLowerCase()}:${emojiId}> **Reward to Reporter:** ${points} points awarded by <@${staffActionBy}> | \`${bot.users.get(staffActionBy)?.username}\``
                    ].join('\n'),
                }],
                components: updatedComponents
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