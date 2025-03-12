import Eris from 'eris';
import { Command } from '../types/command';

export default (bot: Eris.Client): Command => ({
    name: 'accountCreationCheck',
    description: 'Checks if the account is created less than 2 months ago',
    type: 'guildMemberAdd',
    async execute(guild : Eris.Guild, member : Eris.Member): Promise<void> {
        let created = new Date(member.createdAt);
        let now = new Date();
        let diff = now.getTime() - created.getTime();
        let diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (diffDays < 60){
            let dmChannel = await bot.getDMChannel('713588368033710080');
            dmChannel.createMessage({
                embeds: [{
                    color: 0xffffff,
                    description: `<@${member.id}> (${member.username}) created their account <t:${Math.round(member.createdAt/1000)}:R> (<t:${Math.round(member.createdAt/1000)}:F>)`
                }]
            });
        }

    }
});