import Eris from 'eris';
import { Command } from '../../../../../types/command';
import roles from '../../../../../secret/roles.json';
import channels from '../../../../../secret/channels.json';

export default (bot: Eris.Client): Command => ({
    name: 'academic_12_pcm',
    description: 'Adds/removes the Grade 12 academic role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();
        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const roleID = roles.pcm12;
        if (!roleID) return;

        const academicRoles = [
            roles.grade9,
            roles.grade10,
            roles.pcm11,
            roles.pcb11,
            roles.commerce11,
            roles.humanities11,
            roles.pcm12,
            roles.pcb12,
            roles.commerce12,
            roles.humanities12,
            roles.passout
        ]
        
        const hasRoleToRemove = academicRoles.some(role => member.roles.includes(role));
        if (hasRoleToRemove) {
            for (const role of academicRoles.filter(role => member.roles.includes(role))) {
                await member.removeRole(role);
            }
        }

        if (!member.roles.includes(roleID)) {
            await member.addRole(roleID);
            await interaction.editOriginalMessage({
                content: [
                    `- Granted __**<@&${roleID}>**__! Now you have access to the following channels:`,
                    `> <#${channels.physics_12.id}>`,
                    `> <#${channels.chemistry_12.id}>`,
                    `> <#${channels.mathematics_12.id}>`,
                    `> <#${channels.english_12.id}>`,
                    `> <#${channels.additional_12.id}>`
                ].join('\n'),
                embeds: [],
                components: []
            });
        }


}
});