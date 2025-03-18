import Eris from 'eris';
import { Command } from '../../types/command';
import { stars, glitters } from '../../secret/emoji.json'
import { databaseManager } from '../../lib/database';

export default (bot: Eris.Client): Command => ({
    name: 'bump',
    description: 'Rewards the user with support points when the user bumps the server',
    type: 'messageCreate',
    async execute(msg: Eris.Message): Promise<void> {
        if (msg.author.id !== '302050872383242240') return;
        if (msg.interaction?.name !== 'bump') return;
        let user = msg.interaction.user;
        let currentDate = Date.now();
        let nextBumpDate = currentDate + 7200000;

        await msg.channel.createMessage({
            embeds: [{
                color: 0xffffff,
                description: `<a:stars:${stars}> **Thank you for bumping us, <@${user.id}>!**
                > 1 Support Point has been added to your profile! I will remind you to bump again <t:${Math.round(nextBumpDate/1000)}:R> (<t:${Math.round(nextBumpDate/1000)}:F>).`
            }],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: "Check Leaderboard",
                    style: 2,
                    custom_id: 'bump_check_leaderboard',
                    emoji: {
                        id: glitters,
                        name: 'glitters',
                        animated: true
                    }
                }, {
                    type: 2,
                    label: 'Visit Us On DISBOARD',
                    style: 5,
                    url: 'https://disboard.org/server/948219858447921154'
                }]
            }]
        });
        await databaseManager.addSupportPoints(user.id, 1);

        setTimeout(() => {
            msg.channel.createMessage({
                content: '<@&1119667729788567622>',
                embeds: [{
                    color: 0xffffff,
                    description: `<a:stars:1348951777902329866> **It's time to bump!**
                    > Run /bump again to receive 1 Support Point!`
                }]
            })
        }, 7200000);
    }
});