import Eris from 'eris';
import { Command } from '../../../../types/command';
import roles from '../../../../secret/roles.json';

export default (bot: Eris.Client): Command => ({
    name: 'academic_grade12',
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

        
        await interaction.createMessage({
            embeds: [{
                description: [
                    `- You're a student of **__Grade 12__**? Choose your domain:`,
                    `> - __**<@&${roles.pcm12}>**__:`,
                    `>   - Get access to #physics, #chemistry, #maths, #english & #additional-subjects!`,
                    `> - __**<@&${roles.pcb12}>**__:`,
                    `>   - Get access to #physics, #chemistry, #biology, #english & #additional-subjects!`,
                    `> - __**<@&${roles.commerce12}>**__:` ,
                    `>   - Get access to #physics, #accountancy, #business-studies, #economics, #english & #additional-subjects!`,
                    `> - __**<@&${roles.humanities12}>**__:`,
                    `>   - Get access to #history, #geography, #political-science, #economics & #additional-subjects!`
                ].join('\n'),
                color: 0xFFFFFF
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Science Non-Medical',
                        custom_id: 'academic_12_pcm',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Science Medical',
                        custom_id: 'academic_12_pcb',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Commerce',
                        custom_id: 'academic_12_commerce',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Arts/Humanities',
                        custom_id: 'academic_12_humanities',
                    }
                ]
            }],
            flags: Eris.Constants.MessageFlags.EPHEMERAL
        });

}
});