import Eris from 'eris';
import { Command } from '../../types/command';
import { databaseManager } from '../../lib/database';
import { stars, right, wrong, blue, heart } from '../../secret/emoji.json';
import { resourceLibraryChannelID } from '../../secret/config.json';

const STAFF_ROLE_ID = '1143906181182664814';
const STAFF_USER_ID = '428191892950220800';

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
        },{
            name: "rename",
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Rename a resource",
            options: [
                {
                    name: "id",
                    description: "The ID of the resource to rename",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "name",
                    description: "The new name of the resource",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }]
        },{
            name: "retag",
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Retag a resource",
            options: [
                {
                    name: "id",
                    description: "The ID of the resource to retag",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "tag",
                    description: "The new tag for the resource",
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
                }
            ]
        },{
            name: "relink",
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Relink a resource",
            options: [
                {
                    name: "id",
                    description: "The ID of the resource to rename",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "link",
                    description: "The new link of the resource",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }]
        },{
            name: "redescribe",
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Redescribe a resource",
            options: [
                {
                    name: "id",
                    description: "The ID of the resource to rename",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    autocomplete: true
                },
                {
                    name: "description",
                    description: "The new description of the resource",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }]
        },
        {
            name: "reauthor",
            type: Eris.Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Reauthor a resource",
            options: [
                {
                    name: "id",
                    description: "The ID of the resource to reauthor",
                    type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'user',
                    description: 'The user to reward or deduct points from',
                    type: Eris.Constants.ApplicationCommandOptionTypes.USER,
                    required: true
                } as Eris.ApplicationCommandOptionsUser,
            ]
        },
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

            const modifyingCommands = ['rename', 'retag', 'relink', 'redescribe', 'reauthor'];
            if (modifyingCommands.includes(subCommand.name)) {
                const member = interaction.member;
                const userId = interaction.member?.id || interaction.user!.id;
                
                if (!member || (
                    !member.roles.includes(STAFF_ROLE_ID) && 
                    userId !== STAFF_USER_ID
                )) {
                    await interaction.createFollowup({
                        embeds: [{
                            color: 0xFF0000,
                            description: '❌ You do not have permission to modify resources. This command requires staff privileges.'
                        }]
                    });
                    return;
                }
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

                let duplicate = await databaseManager.checkDuplicate('url', url);

                await bot.createMessage(resourceLibraryChannelID, {
                    embeds: [{
                        color: 0xADD8E6,
                        author: {
                            name: "The CBSE Community - Resource Library",
                            icon_url: bot.guilds.get(interaction.guildID!)?.iconURL || undefined
                        },
                        description: [
                            `<:blue:${blue}> **Resource Title:** \`${name}\``,
                            `<:blue:${blue}> **Resource Tag:** \`${tag}\``,
                            `<:blue:${blue}> **Submitted By:** <@${interaction.member?.id || interaction.user!.id}> | \`${(await bot.users.get(interaction.member?.id || interaction.user!.id))?.username}\``,
                            `<:blue:${blue}> **Resource Link:** \`${url}\``,
                            description ? `<:blue:${blue}> **Description:** \`${description}\`` : '',
                            duplicate == false ? '' : `**⚠️ Duplicate URL Found | Resource ID: ${duplicate}**`
                        ].filter(line => line !== '').join('\n'),
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
                        }, {
                            type: Eris.Constants.ComponentTypes.BUTTON,
                            style: Eris.Constants.ButtonStyles.PRIMARY,
                            label: 'Reward Author',
                            custom_id: 'resource_rewardauthor',
                            emoji: {
                                id: stars,
                                name: 'stars',
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
                                label: 'Edit Title',
                                value: 'edit_title'
                            }, {
                                label: 'Edit Tag',
                                value: 'edit_tag'
                            }, {
                                label: 'Edit URL',
                                value: 'edit_url'
                            }, {
                                label: 'Edit Description',
                                value: 'edit_description'
                            }, {
                                label: 'Edit Author',
                                value: 'edit_author'
                            }],
                            min_values: 1,
                            max_values: 1
                    }]
                    }]
                })
            }
            else if (subCommand.name === 'rename') {
                const id = (subCommand.options.find(opt => opt.name === 'id') as Eris.InteractionDataOptionsString).value;
                const newName = (subCommand.options.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value;
                
                const resource = await databaseManager.getResource(id);
                if (!resource || resource.status !== 'active') {
                    await interaction.createFollowup({
                        embeds: [{
                            color: 0xFF0000,
                            description: `❌ Resource ${id} not found or is not active`
                        }]
                    });
                    return;
                }
                
                const success = await databaseManager.editTitle(id, newName, interaction.member?.id || interaction.user!.id);
                
                await interaction.createFollowup({
                    embeds: [{
                        color: success ? 0x00FF00 : 0xFF0000,
                        description: success 
                            ? `✅ Successfully renamed resource ${id} to "${newName}"`
                            : `❌ Failed to rename resource ${id}`
                    }]
                });
            }
            else if (subCommand.name === 'retag') {
                const id = (subCommand.options.find(opt => opt.name === 'id') as Eris.InteractionDataOptionsString).value;
                const newTag = (subCommand.options.find(opt => opt.name === 'tag') as Eris.InteractionDataOptionsString).value;
                
                const resource = await databaseManager.getResource(id);
                if (!resource || resource.status !== 'active') {
                    await interaction.createFollowup({
                        embeds: [{
                            color: 0xFF0000,
                            description: `❌ Resource ${id} not found or is not active`
                        }]
                    });
                    return;
                }
                
                const success = await databaseManager.editTag(id, newTag, interaction.member?.id || interaction.user!.id);
                
                await interaction.createFollowup({
                    embeds: [{
                        color: success ? 0x00FF00 : 0xFF0000,
                        description: success 
                            ? `✅ Successfully retagged resource ${id} to "${newTag}"`
                            : `❌ Failed to retag resource ${id}`
                    }]
                });
            }
            else if (subCommand.name === 'relink') {
                const id = (subCommand.options.find(opt => opt.name === 'id') as Eris.InteractionDataOptionsString).value;
                const newLink = (subCommand.options.find(opt => opt.name === 'link') as Eris.InteractionDataOptionsString).value;
                
                const resource = await databaseManager.getResource(id);
                if (!resource || resource.status !== 'active') {
                    await interaction.createFollowup({
                        embeds: [{
                            color: 0xFF0000,
                            description: `❌ Resource ${id} not found or is not active`
                        }]
                    });
                    return;
                }
                
                const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
                if (!urlPattern.test(newLink)) {
                    await interaction.createFollowup({
                        embeds: [{
                            color: 0xFF0000,
                            description: '❌ Please provide a valid URL starting with http:// or https://'
                        }]
                    });
                    return;
                }
                
                const success = await databaseManager.editUrl(id, newLink, interaction.member?.id || interaction.user!.id);
                
                await interaction.createFollowup({
                    embeds: [{
                        color: success ? 0x00FF00 : 0xFF0000,
                        description: success 
                            ? `✅ Successfully updated link for resource ${id}`
                            : `❌ Failed to update link for resource ${id}`
                    }]
                });
            }
            else if (subCommand.name === 'redescribe') {
                const id = (subCommand.options.find(opt => opt.name === 'id') as Eris.InteractionDataOptionsString).value;
                const newDesc = (subCommand.options.find(opt => opt.name === 'description') as Eris.InteractionDataOptionsString).value;
                
                const resource = await databaseManager.getResource(id);
                if (!resource || resource.status !== 'active') {
                    await interaction.createFollowup({
                        embeds: [{
                            color: 0xFF0000,
                            description: `❌ Resource ${id} not found or is not active`
                        }]
                    });
                    return;
                }
                
                const success = await databaseManager.editDescription(id, newDesc, interaction.member?.id || interaction.user!.id);
                
                await interaction.createFollowup({
                    embeds: [{
                        color: success ? 0x00FF00 : 0xFF0000,
                        description: success 
                            ? `✅ Successfully updated description for resource ${id}`
                            : `❌ Failed to update description for resource ${id}`
                    }]
                });
            }
            else if (subCommand.name === 'reauthor') {
                const id = (subCommand.options.find(opt => opt.name === 'id') as Eris.InteractionDataOptionsString).value;
                const newAuthor = (subCommand.options.find(opt => opt.name === 'user') as Eris.InteractionDataOptionsUser).value;
                
                const resource = await databaseManager.getResource(id);
                if (!resource || resource.status !== 'active') {
                    await interaction.createFollowup({
                        embeds: [{
                            color: 0xFF0000,
                            description: `❌ Resource ${id} not found or is not active`
                        }]
                    });
                    return;
                }
                
                const success = await databaseManager.editAuthor(id, newAuthor, interaction.member?.id || interaction.user!.id);
                
                await interaction.createFollowup({
                    embeds: [{
                        color: success ? 0x00FF00 : 0xFF0000,
                        description: success 
                            ? `✅ Successfully updated author for resource ${id} to <@${newAuthor}>`
                            : `❌ Failed to update author for resource ${id}`
                    }]
                });
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
        if (!subCommand.options) return;

        const focusedOption = subCommand.options.find(opt => 'focused' in opt && opt.focused) as Eris.InteractionDataOptionsString | undefined;
        if (!focusedOption) return;

        if (subCommand.name === 'search' && focusedOption.name === 'name') {
            const tagOption = subCommand.options.find(opt => opt.name === 'tag') as Eris.InteractionDataOptionsString | undefined;
            const tag = tagOption?.value || 'ALL';
            const search = focusedOption.value || '';

            const resources = await databaseManager.serveResources(tag, search);
            await interaction.acknowledge(
                resources.map(resource => {
                    const idPart = ` (${resource.value})`;
                    const maxTitleLength = 100 - idPart.length;
                    let displayName = resource.name;
                    if (displayName.length > maxTitleLength) {
                    displayName = displayName.substring(0, maxTitleLength - 3) + '...';
                    }
                    const fullName = `${displayName}${idPart}`;
                    return {
                    name: fullName,
                    value: resource.value
                    };
                })
            );
        }
        else if (['rename', 'retag', 'relink', 'redescribe', 'reauthor'].includes(subCommand.name) && focusedOption.name === 'id') {
            const search = focusedOption.value || '';
            const resources = await databaseManager.serveResources('ALL', search);
            await interaction.acknowledge(
                resources.map(resource => {
                    const idPart = ` (${resource.value})`;
                    const maxTitleLength = 100 - idPart.length;
                    let displayName = resource.name;
                    if (displayName.length > maxTitleLength) {
                        displayName = displayName.substring(0, maxTitleLength - 3) + '...';
                    }
                    const fullName = `${displayName}${idPart}`;
                    return {
                        name: fullName,
                        value: resource.value
                    };
                })
            );
        }
    }
});