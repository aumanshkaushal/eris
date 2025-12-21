import Eris from 'eris';
import { Command } from '../../../types/command';
import emoji from '../../../secret/emoji.json';
import { developerID } from '../../../secret/config.json';
import roles from '../../../secret/roles.json';
import fs from 'fs';

export default (bot: Eris.Client): Command => ({
    name: 'career',
    description: 'Sends the career self-role embed',
    type: 'onMessage',
    bot,
    async execute(msg: Eris.Message, args: string[]): Promise<void> {
        if (msg.author.id !== developerID && msg.author.id !== bot.guilds.get(msg.guildID!)?.ownerID) return;
        
        msg.channel.createMessage({
            embeds: [{
                description:[
                    `<a:stars:${emoji.stars}> Choose your career interest and get notified to help solve your peers' doubts:`,
                    ``,
                    `<a:heart:${emoji.heart}> **__Choose your career interest__**:`,
                    `> 『\`💻\`』» <@&${roles.jee}>`,
                    `> 『\`🧑‍⚕️\`』» <@&${roles.neet}>`,
                    `> 『\`🎓\`』» <@&${roles.cuet}>`,
                    `> 『\`📚\`』» <@&${roles.upsc}>`,
                    `> 『\`🪖\`』» <@&${roles.defence}>`,
                    `> 『\`📔\`』» <@&${roles.otherexams}>`,
                    ``,
                    `<a:heart:${emoji.heart}> **__Interested in helping? Choose helper roles__**:`,
                    `> 『 __<@&${roles.helperjee}>__ 』» Help people with preparation of **JEE (Joint Entrance Exam)**!`,
                    `> 『 __<@&${roles.helperneet}>__ 』» Help people with preparation of **NEET (National Eligibility-Cum Entrance Test)**!`,
                    `> 『 __<@&${roles.helpercuet}>__ 』» Help people with preparation of **CUET (Common University Entrance Test)**!`,
                    `> 『 __<@&${roles.helperupsc}>__ 』» Help people with preparation of **UPSC (Union Public Service Commission)**!`
                ].join('\n'),
                author: {
                    name: `THE CBSE COMMUNITY - Career Roles:`,
                    icon_url: msg.guildID? bot.guilds.get(msg.guildID)?.iconURL! : undefined
                },
                color: 0xFFFFFF,
                image: {
                    url: 'attachment://careerRoles.jpg'
                }
            }],
            components: [{
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.SELECT_MENU,
                        placeholder: `Want to get updates? Click here!`,
                        min_values: 0,
                        max_values: 6,
                        custom_id: 'career_roleSelect',
                        options: [
                            {
                                label: 'JEE',
                                value: 'career_jee',
                                description: 'Get updates about JEE',
                                emoji: { name: '💻' }
                            },
                            {
                                label: 'NEET',
                                value: 'career_neet',
                                description: 'Get updates about NEET',
                                emoji: { name: '🧑‍⚕️' }
                            },
                            {
                                label: 'CUET',
                                value: 'career_cuet',
                                description: 'Get updates about CUET',
                                emoji: { name: '🎓' }
                            },
                            {
                                label: 'UPSC',
                                value: 'career_upsc',
                                description: 'Get updates about UPSC',
                                emoji: { name: '📚' }
                            },
                            {
                                label: 'Defence',
                                value: 'career_defence',
                                description: 'Get updates about Defence Exams',
                                emoji: { name: '🪖' }
                            },
                            {
                                label: 'Other Exams',
                                value: 'career_otherexams',
                                description: 'Get updates about Other Exams',
                                emoji: { name: '📔' }
                            }
                        ]
                    }
                ]
            }, {
                type: Eris.Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'JEE Helper',
                        custom_id: 'career_jeehelper'
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'NEET Helper',
                        custom_id: 'career_neethelper'
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'CUET Helper',
                        custom_id: 'career_cuethelper'
                    },
                    {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        label: 'UPSC Helper',
                        custom_id: 'career_upschelper'
                    }
                ]
            }]
        }, [{
            file: fs.readFileSync('./assets/careerRoles.jpg'),
            name: 'careerRoles.jpg'
        }]);

    }
});