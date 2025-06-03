import Eris from 'eris';
import { Command } from '../../types/command';
import { developerID } from '../../secret/config.json';
import { right, wrong } from '../../secret/emoji.json';
import util from 'util';

export default (bot: Eris.Client): Command => ({
    name: 'eval',
    description: 'Evaluate JavaScript code',
    type: 'onMessage',
    async execute(msg: Eris.Message): Promise<void> {
        if (msg.author.id !== developerID) {
            return;
        }

        const args = msg.content.split(' ').slice(1).join(' ').trim();

        if (!args) {
            await bot.createMessage(msg.channel.id, {
                content: `<a:wrong:${wrong}> **Error:** No code provided to evaluate.`,
            });
            return;
        }

        try {
            let guild = await bot.guilds.get(msg.guildID || '0');
            let channel = msg.channel;
            let author = msg.author;
            let member = msg.member;

            let output = await eval(`(async () => { return ${args} })()`);
            output = util.inspect(output, { depth: 0 }).substring(0, 1900);

            await bot.createMessage(msg.channel.id, {
                content: `<a:right:${right}> **Output:** \`\`\`js\n${output}\`\`\``,
            });
        } catch (error) {
            await bot.createMessage(msg.channel.id, {
                content: `<a:wrong:${wrong}> **Error:** \`\`\`js\n${error}\`\`\``,
            });
        }
    },
});