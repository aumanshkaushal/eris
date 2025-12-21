import Eris from 'eris';
import { Command } from '../../../types/command';
import roles from '../../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'academic_helperSelect',
    description: 'Adds/removes the helper role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.SELECT_MENU) return;
        
        await interaction.deferUpdate();
        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const helperRolesMap: { [key: string]: string } = {
            helper9: roles.helper9,
            helper10: roles.helper10,
            helperpcm: roles.helperpcm,
            helperpcb: roles.helperpcb,
            helpercommerce: roles.helpercomm,
            helperarts: roles.helperarts
        };
        const selectedValues = interaction.data.values;

        for (const roleID of Object.values(helperRolesMap)) {
            if (member.roles.includes(roleID)) {
                await member.removeRole(roleID);
            }
        }
        for (const value of selectedValues) {
            const roleID = helperRolesMap[value];
            if (roleID && !member.roles.includes(roleID)) {
                await member.addRole(roleID);
            }
        }

        if (selectedValues.length > 0) {
            const grantedRolesMentions = selectedValues.map(value => {
                const roleID = helperRolesMap[value];
                return roleID ? `<@&${roleID}>` : '';
            }).join(', ');
            await interaction.createMessage({
                content: `- Got it! You will now be pinged for solving doubts! You have been granted the following helper roles: ${grantedRolesMentions}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
            } else {
            await interaction.createMessage({
                content: `- From now on, you will not be pinged for solving doubts.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            })
        }

}
});