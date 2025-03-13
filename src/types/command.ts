import Eris from 'eris';

export interface Command {
    name?: string;
    description?: string;
    type: 'onMessage' | 'interactionCreate' | string;
    bot?: Eris.Client;
    execute: (...args: any[]) => Promise<void>;
    options?: Eris.ApplicationCommandOptions[];
    interactionType?: Eris.ApplicationCommandTypes;
    autocomplete?: (interaction: Eris.AutocompleteInteraction) => Promise<void>;
}