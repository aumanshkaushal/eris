import Eris from 'eris';
import { Command } from '../../../types/command';
import roles from '../../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'personal_ageSelect',
    description: 'Adds/removes the age role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.SELECT_MENU) return;
        
        await interaction.deferUpdate();
        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const ageRolesMap: { [key: string]: string } = {
            year14: roles.year14,
            year15: roles.year15,
            year16: roles.year16,
            year17: roles.year17,
            year18above: roles.year18above
        };
        const selectedValues = interaction.data.values;

        for (const roleID of Object.values(ageRolesMap)) {
            if (member.roles.includes(roleID)) {
                await member.removeRole(roleID);
            }
        }
        for (const value of selectedValues) {
            const roleID = ageRolesMap[value];
            if (roleID && !member.roles.includes(roleID)) {
                await member.addRole(roleID);
            }
        }

        if (selectedValues.length > 0) {
            await interaction.createMessage({
                content: `- So you're <@&${ageRolesMap[selectedValues[0]]}> years old? Got it!`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
            } else {
            await interaction.createMessage({
                content: `- Removed your age role selection.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            })
        }

}
});