import Eris from 'eris';
import { Command } from '../../types/command';
import emoji from '../../secret/emoji.json';
import { pcm11, pcb11, commerce11, humanities11, pcm12, pcb12, commerce12, humanities12 } from '../../secret/roles.json';
import { guildID, winterTheme } from '../../secret/config.json';

export default (bot: Eris.Client): Command => ({
    name: 'stream',
    description: 'Fetches the number of students in particular stream',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [{
        name: "info",
        description: "Fetches the number of students in particular stream",
        type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [{
            name: 'stream',
            description: 'The stream you want to check',
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
            choices: [ {
                name: 'Science Medical',
                value: 'science-medical'
            }, {
                name: 'Science Non-Medical',
                value: 'science-non-medical'
            }, {
                name: 'Commerce',
                value: 'commerce'
            }, {
                name: 'Arts/Humanities',
                value: 'arts-humanities'
            }]
        }]
    }],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.APPLICATION_COMMAND) return;

        const commandInteraction = interaction as Eris.CommandInteraction;

        try {
            await commandInteraction.defer();

            const infoOption = commandInteraction.data.options?.find(option => option.name === 'info') as Eris.InteractionDataOptionsSubCommand;
            const stream = (infoOption.options?.find(option => option.name === 'stream') as Eris.InteractionDataOptionsString)?.value;

            let grade11Role: string;
            let grade12Role: string;
            switch (stream) {
                case 'science-medical':
                    grade11Role = pcb11;
                    grade12Role = pcb12;
                    break;
                case 'science-non-medical':
                    grade11Role = pcm11;
                    grade12Role = pcm12;
                    break;
                case 'commerce':
                    grade11Role = commerce11;
                    grade12Role = commerce12;
                    break;
                case 'arts-humanities':
                    grade11Role = humanities11;
                    grade12Role = humanities12;
                    break;
                default:
                    throw new Error('Invalid stream');
            }

            const grade11Count = bot.guilds.get(guildID)?.members.filter(member => member.roles.includes(grade11Role)).length || 0;
            const grade12Count = bot.guilds.get(guildID)?.members.filter(member => member.roles.includes(grade12Role)).length || 0;

            let streamName: string;
            switch (stream) {
                case 'science-medical':
                    streamName = 'Science Medical';
                    break;
                case 'science-non-medical':
                    streamName = 'Science Non-Medical';
                    break;
                case 'commerce':
                    streamName = 'Commerce';
                    break;
                case 'arts-humanities':
                    streamName = 'Arts/Humanities';
                    break;
                default:
                    streamName = 'Unknown';
            }

            await commandInteraction.createFollowup({
                embeds: [{
                    color: winterTheme ? 0x97c1e6 : 0xffffff,
                    description: [`${winterTheme? `<a:blue_butterfly:${emoji.blue_butterfly}>` : `<a:stars:${emoji.stars}>`} **Currently, ${grade11Count+grade12Count} students are pursuing ${streamName} stream!**`,
                    `> ${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Grade 11:** \`${grade11Count}\``,
                    `> ${winterTheme? `<a:blue_heart_pop:${emoji.blue_heart_pop}>` : `<a:heart:${emoji.heart}>`} **Grade 12:** \`${grade12Count}\``].join('\n'),
                }]
            });

        } catch (error) {
            console.error('Error getting count:', error);
            try {
                await commandInteraction.createFollowup({
                    content: 'Failed to get count. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error getting count error message:', followupError);
            }
        }
    }
});