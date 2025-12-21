import Eris from 'eris';
import { Command } from '../../../types/command';
import roles from '../../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'style_colorSelect',
    description: 'Adds/removes the color role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.SELECT_MENU) return;
        
        await interaction.deferUpdate();
        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const colorRolesMap: { [key: string]: string } = {
            white: roles.white,
            red: roles.red,
            blue: roles.blue,
            green: roles.green,
            purple: roles.purple,
            black: roles.black,
            orange: roles.orange
        };
        const selectedValues = interaction.data.values;

        for (const roleID of Object.values(colorRolesMap)) {
            if (member.roles.includes(roleID)) {
                await member.removeRole(roleID);
            }
        }
        for (const value of selectedValues) {
            const roleID = colorRolesMap[value];
            if (roleID && !member.roles.includes(roleID)) {
                await member.addRole(roleID);
            }
        }

        if (selectedValues.length > 0) {
             if (selectedValues[0] in colorRolesMap) {
                const roleID = colorRolesMap[selectedValues[0]];
                await interaction.createMessage({
                    content: `- You have been granted the __**<@&${roleID}>**__ color role!`,
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
             }
             else {
                await interaction.createMessage({
                    content: `- You have removed your color role.`,
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
             }
            } else {
            await interaction.createMessage({
                content: `- You have removed your color role.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            })
        }

}
});