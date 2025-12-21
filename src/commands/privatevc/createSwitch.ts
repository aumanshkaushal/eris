import Eris from 'eris';
import { Command } from '../../types/command';
import { generate, count } from "random-words";
import config from '../../secret/config.json';
import { databaseManager } from '../../lib/database';


export default (bot: Eris.Client): Command => ({
    name: 'createVC',
    description: 'Creates a private voice channel for the user when they join a specific voice channel',
    type: 'voiceChannelSwitch',
    async execute(member : Eris.Member, newChannel: Eris.VoiceChannel | Eris.StageChannel, oldChannel: Eris.VoiceChannel | Eris.StageChannel): Promise<void> {
        const voiceChannelID = config.privateVCCreateChannelID;
        if (newChannel.id !== voiceChannelID) return;


        const guild = member.guild;
        const userID = member.id;
        const channelName = `🔒 ┊ ${generate({ exactly: 1,wordsPerString: 2, separator: "-" })}`;

        try {
            const privateChannel = await guild.createChannel(channelName, Eris.Constants.ChannelTypes.GUILD_VOICE, {
                parentID: config.privateVCParentID,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        type: Eris.Constants.PermissionOverwriteTypes.ROLE,
                        deny: Eris.Constants.Permissions.connect,
                        allow: 0
                    },
                    {
                        id: userID,
                        type: Eris.Constants.PermissionOverwriteTypes.USER,
                        allow: Eris.Constants.Permissions.connect | Eris.Constants.Permissions.speak,
                        deny: 0
                    }
                ]
            })

            await member.edit({ channelID: privateChannel.id });

            await databaseManager.setPrivateVC(privateChannel.id, userID);
            
        } catch (error) {
            console.log("Error creating private VC:", error);
        }
        

    }
});