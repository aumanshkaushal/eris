import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { stars, right, wrong, blue, heart } from '../../secret/emoji.json';
import { resourceLibraryChannelID } from '../../secret/config.json';

export default (bot: Eris.Client): Command => ({
    name: 'resource',
    description: 'Manage resources by searching or adding',
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
        },
        {
            name: 'add',
            description: 'Add resources',
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: 'tag',
                    description: 'The tag to filter by',
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    choices: [
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
                    description: 'The resource name',
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: 'url',
                    description: 'The resource URL',
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: 'description',
                    description: 'The resource description',
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: false
                }
            ]
        }
    ],
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.CommandInteraction) || !interaction.data.options) return;

        const subCommand = interaction.data.options[0] as Eris.InteractionDataOptionsSubCommand;
        await interaction.defer();

        try {
            if (!subCommand.options) {
                throw new Error('Subcommand options are undefined');
            }

            if (subCommand.name === 'search') {
                const resourceId = (subCommand.options.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value;
                const resource = await databaseManager.getResource(resourceId);

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
                                label: 'Rating: ' + Math.round((Number(await databaseManager.getAverageRating(resourceId))) * 10) / 10,
                                custom_id: 'rate',
                                disabled: true,
                                emoji: {
                                    id: heart,
                                    name: 'heart',
                                    animated: true
                                }
                            },
                            {
                                type: Eris.Constants.ComponentTypes.BUTTON,
                                style: Eris.Constants.ButtonStyles.SUCCESS,
                                label: 'Rate Resource',
                                custom_id: 'resource_rate',
                                disabled: false,
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
                                disabled: false,
                                emoji: {
                                    id: wrong,
                                    name: 'wrong',
                                    animated: true
                                }
                            }
                        ]
                    }]
                });
            } 
            else if (subCommand.name === 'add') {
                const name = (subCommand.options.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value;
                const description = (subCommand.options.find(opt => opt.name === 'description') as Eris.InteractionDataOptionsString | undefined)?.value || '';
                const tag = (subCommand.options.find(opt => opt.name === 'tag') as Eris.InteractionDataOptionsString).value;
                const url = (subCommand.options.find(opt => opt.name === 'url') as Eris.InteractionDataOptionsString).value;
                const resourceId = await databaseManager.addTemporaryResource(name, tag, url, description, interaction.member?.id || interaction.user!.id);
            
                await interaction.createFollowup({
                    embeds: [{
                        color: 0x00FF00,
                        description: `✅ Successfully added resource: **${name}** with tag **${tag}** (ID: ${resourceId})`
                    }]
                });

                await bot.createMessage(resourceLibraryChannelID, {
                    embeds: [{
                        color: 0xADD8E6,
                        author: {
                            name: "The CBSE Community - Resource Library",
                            icon_url: bot.guilds.get(interaction.guildID!)?.iconURL || undefined
                        },
                        description: [
                            `<:blue:${blue}> **Resource Name:** \`${name}\``,
                            `<:blue:${blue}> **Resource Tag:** \`${tag}\``,
                            `<:blue:${blue}> **Submitted By:** <@${interaction.member?.id || interaction.user!.id}> | \`${bot.users.get(interaction.member?.id || interaction.user!.id)?.username}\``,
                            `<:blue:${blue}> **Resource Link:** \`${url}\``,
                            description ? `<:blue:${blue}> **Description:** \`${description}\`` : ''
                        ].join('\n'),
                        footer: {
                            text: resourceId
                        },
                        timestamp: new Date().toISOString()
                    }],
                    components: [{
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [{
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.LINK,
                            label: 'Visit',
                            url
                        }, {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.SUCCESS,
                            label: 'Approve',
                            custom_id: 'resource_approve',
                            emoji: {
                                id: right,
                                name: 'right',
                                animated: true
                            }
                        }, {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.DANGER,
                            label: 'Reject',
                            custom_id: 'resource_reject',
                            emoji: {
                                id: wrong,
                                name: 'wrong',
                                animated: true
                            }
                        }]
                    }, {
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [{
                            type: Eris.Constants.ComponentTypes.SELECT_MENU,
                            custom_id: 'resource_edit',
                            placeholder: 'Edit Resource',
                            options: [{
                                label: 'Edit Name',
                                value: 'name'
                            }, {
                                label: 'Edit Tag',
                                value: 'tag'
                            }, {
                                label: 'Edit URL',
                                value: 'url'
                            }, {
                                label: 'Edit Description',
                                value: 'description'
                            }, {
                                label: 'Edit Author',
                                value: 'author'
                            }],
                            min_values: 1,
                            max_values: 1
                    }]
                    }]
                })
            }
        } catch (error) {
            console.error('Error in resource command:', error);
            await interaction.createFollowup({
                embeds: [{
                    color: 0xFF0000,
                    description: '❌ An error occurred while processing the resource command.'
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

        const resources = await databaseManager.serveResources(tag, search);
        await interaction.acknowledge(
            resources.map(resource => ({
                name: resource.name,
                value: resource.value
            }))
        );
    }
});