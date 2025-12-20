import Eris from 'eris';
import { databaseManager } from '../../lib/database';
const { winterTheme } = require('../../secret/config.json');

export default (bot: Eris.Client) => ({
    name: 'move',
    description: 'Move a user to your private voice channel',
    options: [
        {
            name: 'user',
            description: 'The user to invite to your private voice channel',
            type: Eris.Constants.ApplicationCommandOptionTypes.USER,
            required: true
        }
    ],
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    execute: async (interaction: Eris.CommandInteraction) => {
        await interaction.defer();
        const member = interaction.member;
        const userId = interaction.member?.id || interaction.user!.id;
        const targetUserId = (interaction.data.options!.find(opt => opt.name === 'user') as Eris.InteractionDataOptionsUser).value;
        const targetMember = interaction.guildID? bot.guilds.get(interaction.guildID)?.members.get(targetUserId) : null;

        if (!member || !(member instanceof Eris.Member)) {
            return interaction.editOriginalMessage("This command can only be used in a server.");
        }

        const voiceID = await member.voiceState?.channelID;
        if (!voiceID) {
            return interaction.editOriginalMessage("You must be in a voice channel to use this command.");
        }
        const isPrivateVC = await databaseManager.isPrivateVC(voiceID);
        if (!isPrivateVC) {
            return interaction.editOriginalMessage("You can only use this command in private voice channel.");
        }

        const voiceChannelOwner = await databaseManager.getPrivateVCOwner(voiceID);
        if (voiceChannelOwner !== userId) {
            return interaction.editOriginalMessage("You are not the owner of this private voice channel.");
        }

        if (!targetMember) {
            return interaction.editOriginalMessage("The specified user is not in this server.");
        }
        if (!targetMember.voiceState?.channelID) {
            return interaction.editOriginalMessage(`Ask <@${targetUserId}> to join a voice channel first.`);
        }
        
        if (targetMember.id === userId) {
            return interaction.editOriginalMessage("You cannot move yourself.");
        }

        if (targetMember.bot) {
            return interaction.editOriginalMessage("You cannot move a bot.");
        }

        if (targetMember.voiceState.channelID === voiceID) {
            return interaction.editOriginalMessage("The specified user is already in your private voice channel.");
        }

        try {
            await interaction.editOriginalMessage({
                content: `<@${targetUserId}>`,
                embeds: [{
                    description: `**Would you like to join <@${userId}>'s private voice channel?**`,
                    color: winterTheme? 0x97c1e6 : 0xffffff
                }],
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.SUCCESS,
                            label: 'Accept',
                            custom_id: `privatevc_move_accept`
                        },
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.DANGER,
                            label: 'Decline',
                            custom_id: `privatevc_move_decline`
                        }
                    ]
                }]
            })

            await new Promise((resolve) => setTimeout(resolve, 30000));
            const ogMessage = await interaction.getOriginalMessage();
            if ((ogMessage.components as any)?.[0]?.components?.[0]?.disabled === false) {
            return interaction.editOriginalMessage({
                content: `<@${targetUserId}>`,
                embeds: [{
                    description: `**~~Would you like to join <@${userId}>'s private voice channel?~~**`,
                    footer: {
                        text: `This prompt has expired`
                    },
                    color: 0xFF0000
                }],
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.SUCCESS,
                            label: 'Accept',
                            custom_id: `privatevc_move_accept`,
                            disabled: true
                        },
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.DANGER,
                            label: 'Decline',
                            custom_id: `privatevc_move_decline`,
                            disabled: true
                        }
                    ]
                }]
            });
            }

        } catch (error) {
            console.log("Error sending move private VC interaction message:", error);
            return;
        }


        
    }
});