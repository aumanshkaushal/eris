import Eris from 'eris';
import { Command } from '../../types/command';
import { generate, count } from "random-words";
import config from '../../secret/config.json';
import { databaseManager } from '../../lib/database';


export default (bot: Eris.Client): Command => ({
    name: 'deleteVC',
    description: 'Deletes a private voice channel for the user when they leave their private voice channel and no one else is in it',
    type: 'voiceChannelLeave',
    async execute(member : Eris.Member, oldChannel: Eris.VoiceChannel | Eris.StageChannel): Promise<void> {
        const isPrivateVC = await databaseManager.isPrivateVC(oldChannel.id);
        if (!isPrivateVC) return;

        if (oldChannel.voiceMembers.size > 0) return;

        databaseManager.deletePrivateVC(oldChannel.id).catch((error) => {
            console.log("Error deleting private VC from database:", error);
        });

        try {
            await oldChannel.delete("Private VC deleted as it is now empty");
        } catch (error) {
            console.log("Error deleting private VC channel:", error);
        }
        

    }
});