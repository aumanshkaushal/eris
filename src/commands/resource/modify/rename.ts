import Eris from 'eris';
import { databaseManager } from '../../../lib/database';
import { supportManagerRoleID, developerID } from '../../../secret/config.json'

export default (bot: Eris.Client) => ({
    parent: 'resource',
    subcommand: 'rename',
    description: 'Modify the name of a resource',
    options: [
        {
            name: 'id',
            description: 'The ID of the resource to rename',
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
            autocomplete: true
        },
        {
            name: 'name',
            description: 'The new name of the resource',
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            required: true
        }
    ],
    execute: async (interaction: Eris.CommandInteraction) => {
        await interaction.defer();
        const member = interaction.member;
        const userId = interaction.member?.id || interaction.user!.id;

        if (!member || (!member.roles.includes(supportManagerRoleID) && userId !== developerID)) {
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
        const newName = (subCommand.options!.find(opt => opt.name === 'name') as Eris.InteractionDataOptionsString).value;

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

        const success = await databaseManager.editTitle(id, newName, userId);
        await interaction.createFollowup({
            embeds: [{
                color: success ? 0x00FF00 : 0xFF0000,
                description: success 
                    ? `✅ Successfully renamed resource ${id} to "${newName}"`
                    : `❌ Failed to rename resource ${id}`
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