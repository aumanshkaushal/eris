import Eris from 'eris';
import { Command } from '../../types/command';
import { stars } from '../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'selftimeout',
    description: 'Timeout yourself for a specified time',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [{
        name: "time",
        description: "The time you want to timeout yourself for (e.g., 1w 2d 3h 4m 5s)",
        type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
        autocomplete: true,
        required: true
    } as Eris.ApplicationCommandOptions],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.APPLICATION_COMMAND) return;

        const commandInteraction = interaction as Eris.CommandInteraction;
        await commandInteraction.defer();

        try {
            const timeOption = commandInteraction.data.options?.find(opt => opt.name === 'time') as Eris.InteractionDataOptionWithValue;
            const timeInput = timeOption.value as string;

            if (timeInput === 'customtime_info') {
                await commandInteraction.createFollowup({
                    content: '⚠️ You can enter custom time in this format: 1w 2d 3h 4m 5s!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            const validFormat = /^(\d+w)?\s*(\d+d)?\s*(\d+h)?\s*(\d+m)?\s*(\d+s)?$/i;
            if (!validFormat.test(timeInput.replace(/\s+/g, ''))) {
                await commandInteraction.createFollowup({
                    content: '❌ Please enter a valid time format! Use only numbers and w/d/h/m/s (Example: 1w 2d 3h 4m 5s)',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            const parsedTime = parseCustomTime(timeInput);
            if (parsedTime === -1) {
                await commandInteraction.createFollowup({
                    content: '❌ Please enter a valid time! (Example: 1w 2d 3h 4m 5s)',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }

            const guildId = commandInteraction.guildID!;
            const userId = commandInteraction.member!.id;
            const endTimestamp = Date.now() + parsedTime;
            
            await bot.editGuildMember(guildId, userId, {
                communicationDisabledUntil: new Date(endTimestamp)
            }, 'Self-timeout');

            await commandInteraction.createFollowup({
                embeds: [{
                    color: 0xFFFFFF,
                    description: `<a:stars:${stars}> **Your timeout will automatically be removed on <t:${Math.floor(endTimestamp / 1000)}:F> (<t:${Math.floor(endTimestamp / 1000)}:R>)**`
                }]
            });

        } catch (error) {
            console.error('Error executing timeout:', error);
            await commandInteraction.createFollowup({
                content: '❌ Failed to apply timeout. Please try again later!',
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
        }
    },
    async autocomplete(interaction: Eris.AutocompleteInteraction): Promise<void> {
        const timeOption = interaction.data.options.find(opt => opt.name === 'time') as Eris.InteractionDataOptionWithValue;
        const timeInput = timeOption?.value as string || '';

        const validFormat = /^(\d+w)?\s*(\d+d)?\s*(\d+h)?\s*(\d+m)?\s*(\d+s)?$/i;

        if (!timeInput) {
            await interaction.acknowledge([{
                name: "10m",
                value: "10m"
            }, {
                name: "1h",
                value: "1h"
            }, {
                name: "12h",
                value: "12h"
            }, {
                name: "1d",
                value: "1d"
            }, {
                name: "1w",
                value: "1w"
            }, {
                name: "You can also enter custom time: 1w 2d 3h 4m 5s!",
                value: "customtime_info"
            }]);
            return;
        }

        const isValidFormat = validFormat.test(timeInput.replace(/\s+/g, ''));
        const parsedTime = parseCustomTime(timeInput);
        
        if (/^\d+$/.test(timeInput) && parsedTime === -1) {
            await interaction.acknowledge([{
                name: `${timeInput}s`,
                value: `${timeInput}s`
            }]);
            return;
        }

        if (!isValidFormat) {
            await interaction.acknowledge([{
                name: "Invalid format! Use numbers and w/d/h/m/s only",
                value: "time_error"
            }]);
            return;
        }


        if (parsedTime === -1) {
            await interaction.acknowledge([{
                name: "Please enter a valid time! (Example: 1w 2d 3h 4m 5s)",
                value: "time_error"
            }]);
            return;
        }

        await interaction.acknowledge([{
            name: timeInput,
            value: timeInput
        }]);
    }
});

function parseCustomTime(input: string): number {
    const timeRegex = /(?:(\d+)w)?\s*(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i;
    const match = input.match(timeRegex);
    if (!match) return -1;

    const [_, weeks, days, hours, minutes, seconds] = match.map(v => parseInt(v || '0'));
    const totalMilliseconds =
        (weeks * 7 * 24 * 60 * 60 * 1000) +
        (days * 24 * 60 * 60 * 1000) +
        (hours * 60 * 60 * 1000) +
        (minutes * 60 * 1000) +
        (seconds * 1000);

    return totalMilliseconds > 0 ? totalMilliseconds : -1;
}