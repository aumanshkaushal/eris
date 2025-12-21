import Eris from 'eris';
import { Command } from '../../../types/command';
import roles from '../../../secret/roles.json';
import career from './career';

export default (bot: Eris.Client): Command => ({
    name: 'career_roleSelect',
    description: 'Adds/removes the career role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.SELECT_MENU) return;
        
        await interaction.deferUpdate();
        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const careerRolesMap: { [key: string]: string } = {
            career_jee: roles.jee,
            career_neet: roles.neet,
            career_cuet: roles.cuet,
            career_upsc: roles.upsc,
            career_defence: roles.defence,
            career_otherexams: roles.otherexams
        };
        const selectedValues = interaction.data.values;

        for (const roleID of Object.values(careerRolesMap)) {
            if (member.roles.includes(roleID)) {
                await member.removeRole(roleID);
            }
        }
        for (const value of selectedValues) {
            const roleID = careerRolesMap[value];
            if (roleID && !member.roles.includes(roleID)) {
                await member.addRole(roleID);
            }
        }

        if (selectedValues.length > 0) {
            const grantedRolesMentions = selectedValues.map(value => {
                const roleID = careerRolesMap[value];
                return roleID ? `<@&${roleID}>` : '';
            }).join(', ');
            await interaction.createMessage({
                content: `- You will now be pinged for updates regarding career exams: ${grantedRolesMentions}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
            } else {
            await interaction.createMessage({
                content: `- From now on, you will not be pinged for updates regarding career exams.`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            })
        }

}
});