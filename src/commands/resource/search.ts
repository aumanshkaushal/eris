import Eris from 'eris';
import { databaseManager } from '../../lib/database';
import emoji from '../../secret/emoji.json';
import { winterTheme } from '../../secret/config.json';
import fs from 'fs';

export default (bot: Eris.Client) => ({
    parent: 'resource',
    subcommand: 'search',    
    description: 'Search for a resource in the library',
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
    ],
    execute: async (interaction: Eris.CommandInteraction, bot: Eris.Client) => {
        const subCommand = interaction.data.options![0] as Eris.InteractionDataOptionsSubCommand;
        await interaction.defer();
        const resourceId = (subCommand.options!.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value;
        const resource = await databaseManager.getResource(resourceId);

        if (!resource) {
            await interaction.createFollowup({
                embeds: [{
                    color: winterTheme? 0xED365B : 0xFF0000,
                    description: `${winterTheme? `<a:pink_butterfly:${emoji.pink_butterfly}>` : '❌'} Invalid resource selected!`
                }]
            });
            return;
        }

        await interaction.createFollowup({
            embeds: [{
                color: winterTheme? 0x97c1e6 : 0xffffff,
                title: resource.title,
                description: [
                    `『 ${winterTheme? `<a:blue_candycane:${emoji.blue_candycane}>` : `<a:stars:${emoji.stars}>`} 』» **Resource Tag:** \`${resource.tag}\``,
                    `『 ${winterTheme? `<a:blue_candycane:${emoji.blue_candycane}>` : `<a:stars:${emoji.stars}>`} 』» **Submitted By:** <@${resource.author}> | \`${(await bot.users.get(resource.author))?.username}\``,
                    `『 ${winterTheme? `<a:blue_candycane:${emoji.blue_candycane}>` : `<a:stars:${emoji.stars}>`} 』» **Resource Link:** [Click Here](${resource.url}) | \`${resource.url}\``,
                    resource.description ? `『 ${winterTheme? `<a:blue_candycane:${emoji.blue_candycane}>` : `<a:stars:${emoji.stars}>`} 』» **Description:** \`${resource.description}\`` : ''
                ].filter(Boolean).join('\n'),
                image: { url: 'attachment://cbseCommunityBanner.jpg' },
                footer: {
                    text: resourceId,
                    icon_url: interaction.guildID ? bot.guilds.get(interaction.guildID)?.iconURL || undefined : undefined
                }
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.LINK, label: 'Visit', url: resource.url },
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.PRIMARY, label: 'Rating: ' + Math.round((Number(await databaseManager.getAverageRating(resourceId))) * 10) / 10, custom_id: 'rate', disabled: true, emoji: { id: winterTheme? emoji.blue_butterfly : emoji.heart, name: winterTheme? 'blue_butterfly' : 'heart', animated: true } },
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.SUCCESS, label: 'Rate Resource', custom_id: 'resource_rate', disabled: false, emoji: { id: winterTheme? emoji.white_butterfly : emoji.stars, name: winterTheme? 'white_butterfly' : 'stars', animated: true } },
                    { type: Eris.Constants.ComponentTypes.BUTTON, style: Eris.Constants.ButtonStyles.DANGER, label: 'Report Link', custom_id: 'resource_report', disabled: false, emoji: { id: winterTheme? emoji.pink_butterfly : emoji.wrong, name: winterTheme? 'pink_butterfly' : 'wrong', animated: true } }
                ]
            }],
        }, [{
            file: fs.readFileSync(winterTheme? './assets/cbseCommunityXmasBanner.jpg' : './assets/cbseCommunityBanner.jpg'),
            name: 'cbseCommunityBanner.jpg'
        }]);
    },
    autocomplete: async (interaction: Eris.AutocompleteInteraction) => {
        const subCommand = interaction.data.options![0] as Eris.InteractionDataOptionsSubCommand;
        const tagOption = subCommand.options!.find(opt => opt.name === 'tag') as Eris.InteractionDataOptionsString | undefined;
        const tag = tagOption?.value || 'ALL';
        const search = (subCommand.options!.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value || '';

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
                return { name: fullName, value: resource.value };
            })
        );
    }
});