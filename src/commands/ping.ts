import Eris from 'eris';
import { Command } from '../types/command';

export default (bot: Eris.Client): Command => ({
    name: 'ping',
    description: 'Simple ping command',
    type: 'onMessage',
    async execute(msg: Eris.Message): Promise<void> {
        await msg.channel.createMessage('Pong!');
    }
});