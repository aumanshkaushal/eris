import Eris from 'eris';
import { Command } from '../../../../types/command';
import roles from '../../../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'career_upschelper',
    description: 'Adds/removes the UPSC helper role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();
        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const roleID = roles.helperupsc;
        if (!roleID) return;
        if (member.roles.includes(roleID)) {
            await member.removeRole(roleID);
            await interaction.createMessage({
                content: `- Removed __**<@&${roleID}>**__! You will no longer be notified to help others with UPSC preparation.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        } else {
            await member.addRole(roleID);
            await interaction.createMessage({
                content: `- Granted __**<@&${roleID}>**__! You will now be notified to help others with UPSC preparation.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }


}
});