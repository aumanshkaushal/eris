import Eris from 'eris';
import { Command } from '../../../../types/command';
import roles from '../../../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'personal_she',
    description: 'Adds/removes the she/her gender role',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();
        const guild = bot.guilds.get(interaction.guildID!);
        if (!guild) return;

        const member = guild.members.get(interaction.member!.user.id);
        if (!member) return;

        const roleID = roles.sherole;
        if (!roleID) return;

        const personalRoles = [
            roles.herole,
            roles.sherole,
            roles.theyrole
        ]
        
        const hasRoleToRemove = personalRoles.some(role => member.roles.includes(role));
        if (hasRoleToRemove) {
            for (const role of personalRoles.filter(role => member.roles.includes(role))) {
                await member.removeRole(role);
            }
        }

        if (!member.roles.includes(roleID)) {
            await member.addRole(roleID);
            await interaction.createMessage({
                content: [
                    `- Granted __**<@&${roleID}>**__!`,
                ].join('\n'),
                embeds: [],
                components: [],
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }


}
});