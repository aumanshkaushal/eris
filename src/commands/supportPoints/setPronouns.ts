import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { blue } from '../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'setpronouns',
    description: 'Set your pronouns in your profile & get greeted by me!',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [{
        name: "pronouns",
        description: "The pronouns you want to set",
        type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
        required: true
    }],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.CommandInteraction)) {
            return;
        }

        try {
            const commandInteraction = interaction as Eris.CommandInteraction;
            const userID = commandInteraction.user?.id || commandInteraction.member?.user.id || '';
            await interaction.defer();

            if ((await databaseManager.getSupportPoints(userID)) < 50) {
                await interaction.createMessage({
                    content: 'You need atleast 50 support points to set your pronouns!'
                });
                return;
            }

            const pronouns = (commandInteraction.data.options?.find(option => option.name === 'pronouns') as Eris.InteractionDataOptionsString)?.value;
            
            await databaseManager.setUserPronouns(userID, pronouns);

            await interaction.createMessage({
                embeds: [{
                    color: 0xADD8E6,
                    description: `<:blue:${blue}> Your pronouns has been changed to **${pronouns}**!`
                }],
            })


        } catch (error) {
            console.error('Error processing /setpronouns command:', error);
            try {
                await interaction.createMessage({
                    content: 'Failed to set pronouns. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending followup message:', followupError);
            }
        }
    }
});