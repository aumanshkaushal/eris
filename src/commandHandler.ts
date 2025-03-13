import Eris from 'eris';
import { Command } from './types/command';
import * as fs from 'fs';
import * as path from 'path';
import config from './secret/config.json';

export class CommandHandler {
    private bot: Eris.Client;
    private prefix: string = config.prefix;
    private commands: Map<string, Map<string, Command>> = new Map();

    constructor(bot: Eris.Client) {
        this.bot = bot;
        this.loadCommands();
    }

    registerEvents(): void {
        console.log('Registering events for command handler');
        this.commands.forEach((commandMap, eventName) => {
            console.log(`Setting up event handler for: ${eventName}`);
            switch (eventName) {
                case 'onMessage':
                    this.bot.on('messageCreate', async (msg: Eris.Message) => {
                        if (msg.author.id === this.bot.user.id) return;
                        if (!msg.content.startsWith(this.prefix)) return;

                        const content = msg.content.slice(this.prefix.length).trim();
                        const words = content.split(/\s+/);
                        const commandName = words[0].toLowerCase();
                        const args = words.slice(1);

                        const command = commandMap.get(commandName);
                        if (command) {
                            try {
                                await command.execute(msg, args);
                            } catch (error) {
                                console.error(`Error executing onMessage command ${commandName}:`, error);
                            }
                        }
                    });
                    break;

                case 'interactionCreate':
                    this.bot.on('interactionCreate', async (interaction: Eris.Interaction) => {
                        console.log('Interaction event received:', {
                            type: interaction.type,
                            data: 'data' in interaction ? interaction.data : null
                        });

                        if (interaction.type === Eris.Constants.InteractionTypes.APPLICATION_COMMAND) {
                            const commandInteraction = interaction as Eris.CommandInteraction;
                            const command = commandMap.get(commandInteraction.data.name);
                            if (command) {
                                try {
                                    await command.execute(commandInteraction);
                                    console.log(`Successfully executed command: ${command.name}`);
                                } catch (error) {
                                    console.error(`Error executing slash command ${command.name}:`, error);
                                }
                            }
                        }
                        else if (interaction.type === Eris.Constants.InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE) {
                            const autocompleteInteraction = interaction as Eris.AutocompleteInteraction;
                            const command = commandMap.get(autocompleteInteraction.data.name);
                            if (command?.autocomplete) {
                                try {
                                    await command.autocomplete(autocompleteInteraction);
                                    console.log(`Successfully handled autocomplete for: ${command.name}`);
                                } catch (error) {
                                    console.error(`Error handling autocomplete for ${command.name}:`, error);
                                }
                            }
                        }
                        // Keep other interaction types as they were
                        else if (interaction.type === Eris.Constants.InteractionTypes.MESSAGE_COMPONENT) {
                            const componentInteraction = interaction as Eris.ComponentInteraction;
                            const command = commandMap.get(componentInteraction.data.custom_id);
                            if (command) {
                                try {
                                    await command.execute(componentInteraction);
                                } catch (error) {
                                    console.error(`Error executing component command ${command.name}:`, error);
                                }
                            }
                        }
                        else if (interaction.type === Eris.Constants.InteractionTypes.MODAL_SUBMIT) {
                            const modalInteraction = interaction as Eris.ModalSubmitInteraction;
                            commandMap.forEach(async (command) => {
                                if (!command.name || command.name === modalInteraction.data.custom_id) {
                                    try {
                                        await command.execute(modalInteraction);
                                    } catch (error) {
                                        console.error(`Error executing modal command ${command.name}:`, error);
                                    }
                                }
                            });
                        }
                    });
                    break;

                case 'messageCreate':
                    this.bot.on('messageCreate', async (msg: Eris.Message) => {
                        commandMap.forEach(async (command) => {
                            try {
                                await command.execute(msg);
                            } catch (error) {
                                console.error(`Error executing messageCreate command ${command.name}:`, error);
                            }
                        });
                    });
                    break;

                default:
                    this.bot.on(eventName as any, async (...args: any[]) => {
                        commandMap.forEach(async (command) => {
                            try {
                                await command.execute(...args);
                            } catch (error) {
                                console.error(`Error executing ${eventName} command ${command.name}:`, error);
                            }
                        });
                    });
                    break;
            }
        });
    }

    async registerSlashCommands(): Promise<void> {
        const interactionCommands = this.commands.get('interactionCreate');
        if (!interactionCommands) {
            console.log('No interaction commands to register');
            return;
        }
    
        const commands: Eris.ApplicationCommandBulkEditOptions<false, Eris.ApplicationCommandTypes>[] = 
            Array.from(interactionCommands.values())
                .filter(cmd => cmd.interactionType !== undefined)
                .map(cmd => {
                    console.log(`Preparing to register command: ${cmd.name}`, {
                        name: cmd.name,
                        description: cmd.description,
                        type: cmd.interactionType,
                        options: cmd.options || []
                    });
                    const commandObj: Partial<Eris.ApplicationCommandBulkEditOptions<false, Eris.ApplicationCommandTypes>> = {
                        name: cmd.name,
                        type: cmd.interactionType!
                    };
                    if (cmd.interactionType === Eris.Constants.ApplicationCommandTypes.CHAT_INPUT) {
                        commandObj.description = cmd.description || 'No description';
                        commandObj.options = cmd.options || [];
                    }
                    return commandObj as Eris.ApplicationCommandBulkEditOptions<false, Eris.ApplicationCommandTypes>;
                });
    
        if (commands.length === 0) {
            console.log('No slash commands to register');
            return;
        }
    
        try {
            await this.bot.bulkEditCommands(commands);
            console.log('Successfully registered global slash commands:', commands.map(c => c.name));
        } catch (error) {
            console.error('Error registering slash commands:', error);
        }
    }

    private loadCommands(): void {
        const commandsPath = path.join(__dirname, 'commands');
        console.log(`Loading commands from: ${commandsPath}`);
        this.loadCommandsFromDir(commandsPath);
    }

    private loadCommandsFromDir(dir: string): void {
        const files = fs.readdirSync(dir, { withFileTypes: true });
    
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
    
            if (file.isDirectory()) {
                this.loadCommandsFromDir(fullPath);
            } else if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
                try {
                    const commandModule = require(fullPath);
                    let command: Command;
    
                    if (typeof commandModule === 'function') {
                        command = commandModule(this.bot);
                    } else if (commandModule.default) {
                        if (typeof commandModule.default === 'function') {
                            command = commandModule.default(this.bot);
                        } else {
                            command = commandModule.default;
                        }
                    } else {
                        command = commandModule;
                    }
    
                    if (!command.type) {
                        console.warn(`Skipping invalid command in ${fullPath}: Missing type`, command);
                        continue;
                    }
                    
                    if (command.type !== 'interactionCreate' && !command.name) {
                        console.warn(`Skipping invalid command in ${fullPath}: Missing name (required for ${command.type} type)`, command);
                        continue;
                    }
    
                    if (!this.commands.has(command.type)) {
                        this.commands.set(command.type, new Map());
                    }
                    this.commands.get(command.type)!.set(command.name || '', command); 
                    console.log(`Loaded command: ${command.name || 'unnamed'} for type: ${command.type} from ${fullPath}`);
                } catch (error) {
                    console.error(`Error loading command from ${fullPath}:`, error);
                }
            }
        }
    }
}