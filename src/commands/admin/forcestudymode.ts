import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { blue, red } from '../../secret/emoji.json';
const { moderator } = require('../../secret/roles.json');
import { studymode } from '../../secret/roles.json';
const { developerID } = require('../../secret/config.json');

export default (bot: Eris.Client): Command => ({
    name: 'forcestudymode',
    description: 'Forcefully turn on/off study mode of a user',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [{
        name: "user",
        description: "The user to toggle study mode for",
        type: Eris.Constants.ApplicationCommandOptionTypes.USER,
        required: true
    } as Eris.ApplicationCommandOptions],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.CommandInteraction)) {
            return;
        }

        try {
            const commandInteraction = interaction as Eris.CommandInteraction;

            
            if (!interaction.member?.roles.includes(moderator) && interaction.member?.user.id !== developerID) {
                await interaction.createMessage({
                    content: 'You do not have the required role to reward users!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            const userID = (commandInteraction.data.options?.find(option => option.name === 'user') as Eris.InteractionDataOptionsUser)?.value;
            await interaction.defer();
            const member = bot.guilds.get(commandInteraction.guildID ?? '')?.members.get(userID)

            const roles = member?.roles || [];
            if (roles.includes(studymode)) {
                await member?.removeRole(studymode);
                await databaseManager.unlockStudyMode(userID);
                await interaction.createMessage({
                    content: `<:blue:${blue}> Study mode has been exited for <@${userID}>!`,
                    allowedMentions: {
                        everyone: false,
                        users: [userID],
                        roles: []
                    }
                });
            }
            else {
                await member?.addRole(studymode);
                await databaseManager.lockStudyMode(userID);
                await interaction.createMessage({
                    content: `<:blue:${blue}> Study mode has been enabled for <@${userID}>!`,
                    allowedMentions: {
                        everyone: false,
                        users: [userID],
                        roles: []
                    }
                });
            }

        } catch (error) {
            console.error('Error processing /forcestudymode command:', error);
            try {
                await interaction.createMessage({
                    content: 'Failed to put user to studymode. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending followup message:', followupError);
            }
        }
    }
});