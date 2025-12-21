import Eris from 'eris';
import { Command } from '../../../types/command';
import emoji from '../../../secret/emoji.json';
import { developerID } from '../../../secret/config.json';
import roles from '../../../secret/roles.json';
import fs from 'fs';

export default (bot: Eris.Client): Command => ({
    name: 'personal',
    description: 'Sends the personal self-role embed',
    type: 'onMessage',
    bot,
    async execute(msg: Eris.Message, args: string[]): Promise<void> {
        if (msg.author.id !== developerID && msg.author.id !== bot.guilds.get(msg.guildID!)?.ownerID) return;
        
        msg.channel.createMessage({
            embeds: [{
                description:[
                    `<a:stars:${emoji.stars}> Build up your profile by choosing your age & gender:`,
                    ``,
                    `<a:heart:${emoji.heart}> **__Choose your gender__**:`,
                    `> 『 🚹 』» <@&${roles.herole}>`,
                    `> 『 🚺 』» <@&${roles.sherole}>`,
                    `> 『 ⚪ 』» <@&${roles.theyrole}>`,
                    ``,
                    `<a:heart:${emoji.heart}> **__Choose your age__**:`,
                    `> 『 🐭 』» <@&${roles.year14}>`,
                    `> 『 🐰 』» <@&${roles.year15}>`,
                    `> 『 🐨 』» <@&${roles.year16}>`,
                    `> 『 🐯 』» <@&${roles.year17}>`,
                    `> 『 🦁 』» <@&${roles.year18above}>`,
                ].join('\n'),
                author: {
                    name: `THE CBSE COMMUNITY - Personal Roles:`,
                    icon_url: msg.guildID? bot.guilds.get(msg.guildID)?.iconURL! : undefined
                },
                color: 0xFFFFFF,
                image: {
                    url: 'attachment://personalRoles.jpg'
                }
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.PRIMARY,
                        label: '',
                        custom_id: 'personal_he',
                        emoji: {
                            name: '🚹'
                        }
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.DANGER,
                        label: '',
                        custom_id: 'personal_she',
                        emoji: {
                            name: '🚺'
                        }
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: '',
                        custom_id: 'personal_they',
                        emoji: {
                            name: '⚪'
                        }
                    }
                ]
            }, {
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.SELECT_MENU,
                        placeholder: `Click here to select your age`,
                        min_values: 0,
                        max_values: 1,
                        custom_id: 'personal_ageSelect',
                        options: [
                            {
                                label: '14',
                                value: 'year14',
                                emoji: {
                                    name: '🐭'
                                }
                            },
                            {
                                label: '15',
                                value: 'year15',
                                emoji: {
                                    name: '🐰'
                                }
                            },
                            {
                                label: '16',
                                value: 'year16',
                                emoji: {
                                    name: '🐨'
                                }
                            },
                            {
                                label: '17',
                                value: 'year17',
                                emoji: {
                                    name: '🐯'
                                }
                            },
                            {
                                label: '18+',
                                value: 'year18above',
                                emoji: {
                                    name: '🦁'
                                }
                            }
                        ]
                    }
                ]
            }]
        }, [{
            file: fs.readFileSync('./assets/personalRoles.jpg'),
            name: 'personalRoles.jpg'
        }]);

    }
});