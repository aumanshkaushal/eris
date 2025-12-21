import Eris from 'eris';
import { Command } from '../../../types/command';
import emoji from '../../../secret/emoji.json';
import { developerID } from '../../../secret/config.json';
import roles from '../../../secret/roles.json';
import fs from 'fs';

export default (bot: Eris.Client): Command => ({
    name: 'academic',
    description: 'Sends the academic self-role embed',
    type: 'onMessage',
    bot,
    async execute(msg: Eris.Message, args: string[]): Promise<void> {
        if (msg.author.id !== developerID && msg.author.id !== bot.guilds.get(msg.guildID!)?.ownerID) return;

        msg.channel.createMessage({
            embeds: [{
                description: [`<a:stars:${emoji.stars}> Choose your academic level and get notified to help solve your peer's doubts:`,
                    ``,
                `<a:heart:${emoji.heart}> **__Choose your grade__**:`,
                `> 『 \`Grade 9 & Grade 10\` 』» Get access to channels like #english, #maths, #social-science, #science and more!`,
                `> `,
                `> 『 \`Grade 11 & Grade 12\` 』» Acquire access to domain specific channels for streams such as: Science Medical & Non-Medical, Commerce and Arts/Humanities!`,
                ``,
                `<a:heart:${emoji.heart}> **__Interested in helping? Choose helper roles__**:`,
                `> 『 __<@&${roles.helper9}>__ 』» Help students of **Grade 9**!`,
                `> `,
                `> 『 __<@&${roles.helper10}>__ 』» Help students of **Grade 10**!`,
                `> `,
                `> 『 __<@&${roles.helperpcm}>__ 』» Help students of **Grade 11 & 12 - Science Non-Medical**!`,
                `> `,
                `> 『 __<@&${roles.helperpcb}>__ 』» Help students of **Grade 11 & 12 - Science Medical**!`,
                `> `,
                `> 『 __<@&${roles.helpercomm}>__ 』» Help students of **Grade 11 & 12 - Commerce**!`,
                `> `,
                `> 『 __<@&${roles.helperarts}>__ 』» Help students of **Grade 11 & 12 - Arts/Humanities**!`
                ].join('\n'),
                author: {
                    name: `THE CBSE COMMUNITY - Academic Roles:`,
                    icon_url: msg.guildID? bot.guilds.get(msg.guildID)?.iconURL! : undefined
                },
                color: 0xFFFFFF,
                image: {
                    url: 'attachment://academicRoles.jpg'
                }
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Grade 9',
                        custom_id: 'academic_grade9',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Grade 10',
                        custom_id: 'academic_grade10',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Grade 11',
                        custom_id: 'academic_grade11',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Grade 12',
                        custom_id: 'academic_grade12',
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'Passout',
                        custom_id: 'academic_passout',
                    }
                ]
            }, {
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.SELECT_MENU,
                        placeholder: `Interested in helping? Click here!`,
                        min_values: 0,
                        max_values: 6,
                        custom_id: 'academic_helperSelect',
                        options: [
                            {
                                label: 'Grade 9 - Helper',
                                description: 'Help students of Grade 9',
                                value: 'helper9'
                            },
                            {
                                label: 'Grade 10 - Helper',
                                description: 'Help students of Grade 10',
                                value: 'helper10'
                            },
                            {
                                label: 'Science Non-Medical/PCM - Helper',
                                description: 'Help students of domain: Science Non-Medical',
                                value: 'helperpcm'
                            },
                            {
                                label: 'Science Medical/PCB - Helper',
                                description: 'Help students of domain: Science Medical',
                                value: 'helperpcb'
                            },
                            {
                                label: 'Commerce - Helper',
                                description: 'Help students of domain: Commerce',
                                value: 'helpercommerce'
                            },
                            {
                                label: 'Arts/Humanities - Helper',
                                description: 'Help students of domain: Arts/Humanities',
                                value: 'helperhumanities'
                            }
                        ]
                    }
                ]
            }]
        }, [{
            file: fs.readFileSync('./assets/academicRoles.jpg'),
            name: 'academicRoles.jpg'
        }]);

    }
});