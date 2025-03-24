import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { guildID } from '../../secret/config.json';
import { blue } from '../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'nickme',
    description: 'Change your nickname to a specified nickname',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [{
        name: "name",
        description: "The nickname you want to set",
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

            if ((await databaseManager.getSupportPoints(userID)) < 30) {
                await interaction.createMessage({
                    content: 'You need atleast 30 support points to change your nickname!'
                });
                return;
            }

            const newNickname = (commandInteraction.data.options?.find(option => option.name === 'name') as Eris.InteractionDataOptionsString)?.value;
            await bot.guilds.get(guildID)?.editMember(userID, {
                nick: newNickname
            })

            await interaction.createMessage({
                embeds: [{
                    color: 0xADD8E6,
                    description: `<:blue:${blue}> Your nickname has been changed to **${newNickname}**!`
                }],
            })


        } catch (error) {
            console.error('Error processing /nickme command:', error);
            try {
                await interaction.createMessage({
                    content: 'Failed to assign nickname. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending followup message:', followupError);
            }
        }
    }
});