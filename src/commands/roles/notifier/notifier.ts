import Eris from 'eris';
import { Command } from '../../../types/command';
import emoji from '../../../secret/emoji.json';
import { developerID } from '../../../secret/config.json';
import roles from '../../../secret/roles.json';
import fs from 'fs';

export default (bot: Eris.Client): Command => ({
    name: 'notifier',
    description: 'Sends the notifier self-role embed',
    type: 'onMessage',
    bot,
    async execute(msg: Eris.Message, args: string[]): Promise<void> {
        if (msg.author.id !== developerID && msg.author.id !== bot.guilds.get(msg.guildID!)?.ownerID) return;

        msg.channel.createMessage({
            embeds: [{
                description: [`<a:heart:${emoji.heart}> **__Want to get notified? Choose notifier roles__**:`,
                `> 『 __<@&${roles.bumpArmy}>__ 』» Get pinged everytime a **bump** is available and earn support points!`,
                `> `,
                `> 『 __<@&${roles.botUpdates}>__ 』» Get updates about **changes** in the official bots!`].join('\n'),
                author: {
                    name: `THE CBSE COMMUNITY - Notifier Roles:`,
                    icon_url: msg.guildID? bot.guilds.get(msg.guildID)?.iconURL! : undefined
                },
                color: 0xFFFFFF,
                image: {
                    url: 'attachment://notifierRoles.jpg'
                }
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Bump Army',
                        custom_id: 'notifier_bump',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Bot Updates',
                        custom_id: 'notifier_botupdates',
                    }
                ]
            }]
        }, [{
            file: fs.readFileSync('./assets/notifierRoles.jpg'),
            name: 'notifierRoles.jpg'
        }]);

    }
});