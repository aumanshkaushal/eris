import Eris from 'eris';
import { databaseManager } from '../../lib/database';
import { blue, right, wrong, stars } from '../../secret/emoji.json';
import { resourceLibraryChannelID } from '../../secret/config.json';

export default (bot: Eris.Client) => ({
    parent: 'resource',
    subcommand: 'add',
    description: 'Add a new resource to the library',
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
    ],
    execute: async (interaction: Eris.CommandInteraction, bot: Eris.Client) => {
        const subCommand = interaction.data.options![0] as Eris.InteractionDataOptionsSubCommand;
        await interaction.defer();
        const name = (subCommand.options!.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value;
        const description = (subCommand.options!.find(opt => opt.name === 'description') as Eris.InteractionDataOptionsString | undefined)?.value || '';
        const tag = (subCommand.options!.find(opt => opt.name === 'tag') as Eris.InteractionDataOptionsString).value;
        const url = (subCommand.options!.find(opt => opt.name === 'url') as Eris.InteractionDataOptionsString).value;
        const resourceId = await databaseManager.addTemporaryResource(name, tag, url, description, interaction.member?.id || interaction.user!.id);

        await interaction.createFollowup({
            embeds: [{
                color: 0x00FF00,
                description: `✅ Successfully added resource: **${name}** with tag **${tag}** (ID: ${resourceId})`
            }]
        });

        const duplicate = await databaseManager.checkDuplicate('url', url);

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
                    duplicate === false ? '' : `**⚠️ Duplicate URL Found | Resource ID: ${duplicate}**`
                ].filter(line => line !== '').join('\n'),
                footer: { text: resourceId },
                timestamp: new Date().toISOString()
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.LINK, label: 'Visit', url },
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.SUCCESS, label: 'Approve', custom_id: 'resource_approve', emoji: { id: right, name: 'right', animated: true } },
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.DANGER, label: 'Reject', custom_id: 'resource_reject', emoji: { id: wrong, name: 'wrong', animated: true } },
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.PRIMARY, label: 'Reward Author', custom_id: 'resource_rewardauthor', emoji: { id: stars, name: 'stars', animated: true } }
                ]
            }, {
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [{
                    type: Eris.Constants.ComponentTypes.SELECT_MENU,
                    custom_id: 'resource_edit',
                    placeholder: 'Edit Resource',
                    options: [
                        { label: 'Edit Title', value: 'edit_title' },
                        { label: 'Edit Tag', value: 'edit_tag' },
                        { label: 'Edit URL', value: 'edit_url' },
                        { label: 'Edit Description', value: 'edit_description' },
                        { label: 'Edit Author', value: 'edit_author' }
                    ],
                    min_values: 1,
                    max_values: 1
                }]
            }]
        });
    }
});