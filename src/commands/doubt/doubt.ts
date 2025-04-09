import Eris from 'eris';
import { Command } from '../../types/command';
import { guildID, imgbbApiKey } from '../../secret/config.json';
import roles from '../../secret/roles.json';
import fetch from 'node-fetch';
import channels from '../../secret/channels.json'
export default (bot: Eris.Client): Command => ({
    name: 'doubt',
    description: 'Ask a doubt to the respective community',
    type: 'interactionCreate',
    interactionType: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    bot,
    options: [{
        name: 'subject',
        description: 'Subject of the doubt',
        type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
        autocomplete: true,
        required: true
    }, {
        name: 'doubt',
        description: 'Your doubt',
        type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
        required: true
    }, {
        name: 'attachment',
        description: 'Attachment of the doubt',
        type: 11,
        required: false
    }],
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (interaction.type !== Eris.Constants.InteractionTypes.APPLICATION_COMMAND) return;
        const commandInteraction = interaction as Eris.CommandInteraction;

        try {
            await commandInteraction.defer();

            const subjectOption = commandInteraction.data.options?.find(opt => opt.name === 'subject') as Eris.InteractionDataOptionWithValue;
            const doubtOption = commandInteraction.data.options?.find(opt => opt.name === 'doubt') as Eris.InteractionDataOptionWithValue;
            const attachmentOption = commandInteraction.data.options?.find(opt => opt.name === 'attachment') as Eris.InteractionDataOptionWithValue | undefined;

            const subject = subjectOption?.value;
            const doubt = doubtOption?.value;
            const grade = await getGrade(bot, commandInteraction.member?.user.id || '');

            let attachmentUrl: string | undefined = undefined;

            if (attachmentOption && commandInteraction.data.resolved) {
                const resolved: any = commandInteraction.data.resolved;
                const discordUrl = resolved.attachments?.[attachmentOption.value as string]?.url;

                if (discordUrl) {
                    const response = await fetch(discordUrl);
                    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                    const buffer = await Buffer.from(await response.arrayBuffer());
                    const base64Image = buffer.toString('base64');

                    const formData = new URLSearchParams();
                    formData.append('key', imgbbApiKey);
                    formData.append('image', base64Image);

                    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const imgbbData = await imgbbResponse.json() as { success: boolean; data: { url: string } };

                    if (imgbbData.success) {
                        attachmentUrl = imgbbData.data.url;
                    } else {
                        console.error('ImgBB upload failed:', imgbbData);
                        attachmentUrl = undefined;
                    }
                }
            }

            const channelID = channels[subject as string]['id'] as string;
            const channel = bot.guilds.get(guildID)?.channels.get(channelID) as Eris.TextableChannel;
            if (!channel) {
                await commandInteraction.createFollowup({
                    content: 'Failed to find the channel for the subject.',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
                return;
            }
            const subjectName = channels[subject as string]['subject'] as string;
            const gradeNum = channels[subject as string]['grade'] as string;

            const roleIDs = channels[subject as string]['helperrole'] as string[];

            const roleNames = roleIDs
                .map(id => bot.guilds.get(guildID)?.roles.get(id)?.name)
                .filter(name => name)
                .join(' ');

            await bot.createMessage(commandInteraction.channel.id, {
                content: `<@${commandInteraction.member?.user.id}> ${roleNames} | This message will be sent in <#${channelID}>`,
                embed: {
                    title: `Doubt in ${subjectName} (${gradeNum}th)`,
                    description: `> ${doubt}\n\n**From:** <@${commandInteraction.member?.user.id}>`,
                    image: {
                        url: attachmentUrl? attachmentUrl : 'https://cdn.discordapp.com/attachments/948989141562040370/1117037169840750682/1686392804883.jpg'
                    },
                    color: 0xFFFFFF
                },
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [ {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.PRIMARY,
                        custom_id: 'doubt_rotate_anticlockwise',
                        emoji: {
                          id: null,
                          name: '↪️'  
                        },
                        disabled: !attachmentUrl
                    }, {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.PRIMARY,
                        custom_id: 'doubt_rotate_clockwise',
                        emoji: {
                          id: null,
                          name: '↩️'  
                        },
                        disabled: !attachmentUrl
                    }, {
                        type: Eris.Constants.ComponentTypes.BUTTON,
                        style: Eris.Constants.ButtonStyles.SUCCESS,
                        custom_id: 'doubt_ai',
                        emoji: {
                            id: null,
                            name: '🤖' 
                        },
                    }]
                }]
            });
            await commandInteraction.createFollowup({
                content: `Your doubt has been sent to <#${channelID}>! Check it out here`
            })

        } catch (error) {
            console.error('Error asking doubt:', error);
            try {
                await commandInteraction.createFollowup({
                    content: 'Failed to ask doubt. Try again later!',
                    flags: Eris.Constants.MessageFlags.EPHEMERAL
                });
            } catch (followupError) {
                console.error('Error sending error message:', followupError);
            }
        }
    },
    autocomplete: async (interaction: Eris.AutocompleteInteraction) => {
        await interaction.acknowledge(await getSubjects(bot, interaction.member?.user.id || ''));
    }
} as any);

const gradeSubjects: Record<string, string[]> = {
    '9': ['Mathematics', 'Science', 'Social Science', 'English', 'English Communicative', 'Hindi A', 'Hindi B', 'Sanskrit', 'Languages', 'Computer Science', 'Additional'],
    '10': ['Mathematics', 'Science', 'Social Science', 'English', 'English Communicative', 'Hindi A', 'Hindi B', 'Sanskrit', 'Languages', 'Computer Science', 'Additional'],
    'pcm11': ['Mathematics', 'Physics', 'Chemistry', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional'],
    'pcb11': ['Biology', 'Physics', 'Chemistry', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional'],
    'commerce11': ['Business Studies', 'Accountancy', 'Economics', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional'],
    'humanities11': ['History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional'],
    'pcm12': ['Mathematics', 'Physics', 'Chemistry', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional'],
    'pcb12': ['Biology', 'Physics', 'Chemistry', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional'],
    'commerce12': ['Business Studies', 'Accountancy', 'Economics', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional'],
    'humanities12': ['History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'English', 'Hindi', 'Languages', 'Physical Education', 'Computer Science', 'Additional']
};

async function getGrade(bot: Eris.Client, userID: string): Promise<string | null> {
    const guild = await bot.guilds.get(guildID);
    const member = await guild?.members.get(userID);
    if (!member) return null;

    for (const [grade, roleId] of Object.entries(roles)) {
        if (member.roles.includes(roleId)) return grade;
    }
    return null;
}

async function getSubjects(bot: Eris.Client, userID: string): Promise<Eris.ApplicationCommandOptionChoice<unknown>[]> {
    const grade = await getGrade(bot, userID);
    if (!grade || !gradeSubjects[grade]) return [];

    const gradeNum = grade.match(/\d+/)?.[0] || '';
    return gradeSubjects[grade].map(subject => ({
        name: `${subject} (${gradeNum}th)`,
        value: `${subject.toLowerCase().replace(/\s+/g, '')}_${gradeNum}`
    }));
}