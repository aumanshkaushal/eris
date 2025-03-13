import Eris from 'eris';
import { Command } from '../../types/command';
import { cache } from '../../lib/cache';
import { stars, wrong } from '../../secret/emoji.json';

export default (bot: Eris.Client): Command => ({
    name: 'resource',
    description: 'Search for resources by tag and name',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: 'search',
            description: 'Search resources',
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: 'tag',
                    description: 'The tag to filter by',
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    choices: [
                        { name: 'All', value: 'ALL' },
                        { name: 'Grade IX', value: 'IX' },
                        { name: 'Grade X', value: 'X' },
                        { name: 'Grade XI', value: 'XI' },
                        { name: 'Grade XII', value: 'XII' },
                        { name: 'JEE', value: 'JEE' },
                        { name: 'NEET', value: 'NEET' },
                        { name: 'General', value: 'GEN' }
                    ]
                },
                {
                    name: 'name',
                    description: 'The resource name to search for',
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.CommandInteraction)) return;
        if (!interaction.data.options || (interaction.data.options[0] as Eris.InteractionDataOptionsSubCommand).name !== 'search') return;

        await interaction.defer();

        try {
            const subCommand = interaction.data.options[0] as Eris.InteractionDataOptionsSubCommand;
            if (!subCommand.options) throw new Error('Subcommand options are undefined');
            const resourceId = (subCommand.options.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value;

            const resource = await cache.getResource(resourceId);

            if (!resource) {
                await interaction.createFollowup({
                    embeds: [{
                        color: 0xFF0000,
                        description: '❌ Invalid resource selected!'
                    }]
                });
                return;
            }

            await interaction.createFollowup({
                embeds: [{
                    color: 0xFFFFFF,
                    title: resource.title,
                    description: [
                        `『 <a:stars:${stars}> 』» **Resource Tag:** \`${resource.tag}\``,
                        `『 <a:stars:${stars}> 』» **Submitted By:** <@${resource.author}> | \`${(await bot.users.get(resource.author))?.username}\``,
                        `『 <a:stars:${stars}> 』» **Resource Link:** [Click Here](${resource.url}) | \`${resource.url}\``,
                        resource.description ? `『 <a:stars:${stars}> 』» **Description:** \`${resource.description}\`` : ''
                    ].filter(Boolean).join('\n'),
                    image: {
                        url: 'https://cdn.discordapp.com/attachments/948989141562040370/1117037169840750682/1686392804883.jpg'
                    },
                    footer: {
                        text: resourceId,
                        icon_url: interaction.guildID ? bot.guilds.get(interaction.guildID)?.iconURL || undefined : undefined
                    }
                }],
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.LINK,
                            label: 'Visit',
                            url: resource.url
                        },
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.PRIMARY,
                            label: 'Rate Resource',
                            custom_id: 'resource_rate',
                            disabled: true,
                            emoji: {
                                id: stars,
                                name: 'stars',
                                animated: true
                            }
                        },
                        {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.DANGER,
                            label: 'Report Link',
                            custom_id: 'resource_report',
                            disabled: true,
                            emoji: {
                                id: wrong,
                                name: 'wrong',
                                animated: true
                            }
                        }
                    ]
                }]
            });

        } catch (error) {
            console.error('Error in resource command:', error);
            await interaction.createFollowup({
                embeds: [{
                    color: 0xFF0000,
                    description: '❌ An error occurred while fetching the resource.'
                }]
            });
        }
    },
    async autocomplete(interaction: Eris.AutocompleteInteraction): Promise<void> {
        const subCommand = interaction.data.options[0] as Eris.InteractionDataOptionsSubCommand;
        if (subCommand.name !== 'search' || !subCommand.options) return;

        const focusedOption = subCommand.options.find(opt => 'focused' in opt && opt.focused) as Eris.InteractionDataOptionsString | undefined;
        if (!focusedOption || focusedOption.name !== 'name') return;

        const tagOption = subCommand.options.find(opt => opt.name === 'tag') as Eris.InteractionDataOptionsString | undefined;
        const tag = tagOption?.value || 'ALL';
        const search = focusedOption.value || '';

        const resources = await cache.serveResources(tag, search);
        await interaction.acknowledge(
            resources.map(resource => ({
                name: resource.name,
                value: resource.value
            }))
        );
    }
});