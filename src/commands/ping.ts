import Eris from 'eris';
import { Command } from '../types/command';

export default (bot: Eris.Client): Command => ({
    name: 'ping',
    description: 'Simple ping command',
    type: 'onMessage',
    async execute(msg: Eris.Message): Promise<void> {
		let start = Date.now();

		bot.createMessage(msg.channel.id, 'Pong! ')
			.then(msg => {
				let diff = (Date.now() - start);
                msg.edit({
                    content: ``,
                    embeds: [{
                        title: 'Pong!',
                        description: `🏓 ${diff}ms`,
                        color: 0x2F3136
                    }]
                })
			});
    }
});