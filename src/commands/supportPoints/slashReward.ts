import Eris from 'eris';
import { Command } from '../../types/command';
import { addSupportPoints } from '../../lib/supportPoints/addSupportPoints';
import { getSupportPoints } from '../../lib/supportPoints/getSupportPoints';

export default (bot: Eris.Client): Command => ({
    name: 'reward',
    description: 'Reward or deduct support points from a user',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: 'user',
            description: 'The user to reward or deduct points from',
            type: Eris.Constants.ApplicationCommandOptionTypes.USER,
            required: true
        } as Eris.ApplicationCommandOptions,
        {
            name: 'modification',
            description: 'The number of points to add (+) or deduct (-) (e.g., +1 or -1)',
            type: Eris.Constants.ApplicationCommandOptionTypes.INTEGER,
            required: true
        } as Eris.ApplicationCommandOptions
    ] as Eris.ApplicationCommandOptions[],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.CommandInteraction)) {
            return;
        }

        try {
            const commandInteraction = interaction as Eris.CommandInteraction;
            const targetUser = (commandInteraction.data.options?.find(option => option.name === 'user') as Eris.InteractionDataOptionsUser)?.value;
            const modification = (commandInteraction.data.options?.find(option => option.name === 'modification') as Eris.InteractionDataOptionsInteger)?.value;

            if (!commandInteraction.member?.roles.includes('1143906181182664814') && commandInteraction.member?.user.id !== '428191892950220800') {
                await interaction.createFollowup({
                    content: 'You do not have the required role to reward users!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            await addSupportPoints(targetUser, modification);

            const userPoints = await getSupportPoints(targetUser);
            
            await interaction.createMessage({
                content: `Successfully rewarded <@${targetUser}> with ${modification} support point(s)! They now have ${userPoints} points.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });


        } catch (error) {
            console.error('Error processing /reward command:', error);
            try {
                await interaction.createMessage({
                    content: 'Failed to process the reward. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending followup message:', followupError);
            }
        }
    }
});