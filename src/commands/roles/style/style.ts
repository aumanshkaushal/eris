import Eris from 'eris';
import { Command } from '../../../types/command';
import emoji from '../../../secret/emoji.json';
import { developerID } from '../../../secret/config.json';
import roles from '../../../secret/roles.json';
import fs from 'fs';

export default (bot: Eris.Client): Command => ({
    name: 'style',
    description: 'Sends the style self-role embed',
    type: 'onMessage',
    bot,
    async execute(msg: Eris.Message, args: string[]): Promise<void> {
        if (msg.author.id !== developerID && msg.author.id !== bot.guilds.get(msg.guildID!)?.ownerID) return;

        msg.channel.createMessage({
            embeds: [{
            description: [
                `<a:stars:${emoji.stars}> Style yourself by choosing your favorite color to be displayed on your name while you chat:`,
                ``,
                `> 『 \`⚪\` 』» <@&${roles.white}>`,
                `> 『 \`🔴\` 』» <@&${roles.red}>`,
                `> 『 \`🔵\` 』» <@&${roles.blue}>`,
                `> 『 \`🟢\` 』» <@&${roles.green}>`,
                `> 『 \`🟣\` 』» <@&${roles.purple}>`,
                `> 『 \`⚫\` 』» <@&${roles.black}>`,
                `> 『 \`🟠\` 』» <@&${roles.orange}>`,
            ].join('\n'),
            author: {
                name: `THE CBSE COMMUNITY - Style Roles:`,
                icon_url: msg.guildID ? bot.guilds.get(msg.guildID)?.iconURL! : undefined
            },
            color: 0xFFFFFF,
            image: {
                url: 'attachment://styleRoles.jpg'
            }
            }],
            components: [{
            type: Eris.Constants.ComponentTypes.ACTION_ROW,
            components: [
                {
                type: Eris.Constants.ComponentTypes.SELECT_MENU,
                placeholder: `Click here to select style roles!`,
                min_values: 0,
                max_values: 1,
                custom_id: 'style_colorSelect',
                options: [
                    {
                    label: 'White',
                    value: 'white',
                    emoji: {
                        name: '⚪'
                    }
                    },
                    {
                    label: 'Red',
                    value: 'red',
                    emoji: {
                        name: '🔴'
                    }
                    },
                    {
                    label: 'Blue',
                    value: 'blue',
                    emoji: {
                        name: '🔵'
                    }
                    },
                    {
                    label: 'Green',
                    value: 'green',
                    emoji: {
                        name: '🟢'
                    }
                    },
                    {
                    label: 'Purple',
                    value: 'purple',
                    emoji: {
                        name: '🟣'
                    }
                    },
                    {
                    label: 'Black',
                    value: 'black',
                    emoji: {
                        name: '⚫'
                    }
                    },
                    {
                    label: 'Orange',
                    value: 'orange',
                    emoji: {
                        name: '🟠'
                    }
                    },
                    {
                    label: 'None',
                    value: 'none',
                    emoji: {
                        name: '🚫'
                    }
                    }
                ]
                }
            ]
            }]
        }, [{
                    file: fs.readFileSync('./assets/styleRoles.jpg'),
                    name: 'styleRoles.jpg'
        }]);

    }
});