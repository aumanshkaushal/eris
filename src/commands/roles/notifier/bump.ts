import Eris from 'eris';
import { Command } from '../../../types/command';
import roles from '../../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'notifier_bump',
    description: 'Add/Remove the bump notifier role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();

        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const roleID = roles.bumpArmy;
        if (!roleID) return;
        if (member.roles.includes(roleID)) {
            try {
                await member.removeRole(roleID, 'Notifier role removed via button');
                await interaction.createMessage({
                    content: `- From now on, you will **__not__** be pinged whenever a **bump** is available!`,
                    flags: 64
                });
            } catch (error) {
                console.log('Error removing notifier role:', error);
            }
        } else {
            try {
                await member.addRole(roleID, 'Notifier role added via button');
                await interaction.createMessage({
                    content: `- From now on, you will be pinged whenever a **bump** is available!`,
                    flags: 64
                });
            } catch (error) {
                console.log('Error adding notifier role:', error);
            }
    }
}
});