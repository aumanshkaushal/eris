import Eris from 'eris';
import { databaseManager } from '../../lib/database';

const STAFF_ROLE_ID = '1143906181182664814';
const STAFF_USER_ID = '428191892950220800';

export default (bot: Eris.Client) => ({
    parent: 'resource',
    subcommand: 'retag',
    description: 'Modify the tag of a resource',
    options: [
        {
            name: 'id',
            description: 'The ID of the resource to retag',
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
            autocomplete: true
        },
        {
            name: 'tag',
            description: 'The new tag for the resource',
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
    ],
    execute: async (interaction: Eris.CommandInteraction) => {
        await interaction.defer();
        const member = interaction.member;
        const userId = interaction.member?.id || interaction.user!.id;

        if (!member || (!member.roles.includes(STAFF_ROLE_ID) && userId !== STAFF_USER_ID)) {
            await interaction.createFollowup({
                embeds: [{
                    color: 0xFF0000,
                    description: '❌ You do not have permission to modify resources. This command requires staff privileges.'
                }]
            });
            return;
        }

        const subCommand = interaction.data.options![0] as Eris.InteractionDataOptionsSubCommand;
        const id = (subCommand.options!.find(opt => opt.name === 'id') as Eris.InteractionDataOptionsString).value;
        const newTag = (subCommand.options!.find(opt => opt.name === 'tag') as Eris.InteractionDataOptionsString).value;

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

        const success = await databaseManager.editTag(id, newTag, userId);
        await interaction.createFollowup({
            embeds: [{
                color: success ? 0x00FF00 : 0xFF0000,
                description: success 
                    ? `✅ Successfully retagged resource ${id} to "${newTag}"`
                    : `❌ Failed to retag resource ${id}`
            }]
        });
    },
    autocomplete: async (interaction: Eris.AutocompleteInteraction) => {
        const subCommand = interaction.data.options![0] as Eris.InteractionDataOptionsSubCommand;
        const search = (subCommand.options!.find(opt => opt.name === 'id') as Eris.InteractionDataOptionsString).value || '';
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
                return { name: fullName, value: resource.value };
            })
        );
    }
});