import Eris from 'eris';
import { Command } from '../../types/command';
import sharp from 'sharp';
import fetch from 'node-fetch';

export default (bot: Eris.Client): Command => ({
    name: 'doubt_rotate_clockwise',
    description: 'Rotate the image clockwise',
    type: 'interactionCreate',
    bot,
    async execute(interaction: Eris.Interaction): Promise<void> {
        if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== Eris.Constants.ComponentTypes.BUTTON) return;
        
        await interaction.deferUpdate();
        console.log('Start time:', new Date().toISOString());
        const startTime = new Date().getTime();

        try {
            let imageUrl = interaction.message.embeds[0]?.image?.url;
            if (!imageUrl) {
                throw new Error('No image URL found in message');
            }
            let image = await fetch(imageUrl)
            console.log('Image fetch time:', new Date().toISOString());
            console.log('Time since start:', new Date().getTime() - startTime, 'ms');
            if (!image.ok) {
                throw new Error('Failed to fetch image');
            }

            let rotatedImage = (await sharp(await Buffer.from(await image.arrayBuffer())).rotate(90).toBuffer()).toString('base64');
            console.log('Image rotation time:', new Date().toISOString());
            console.log('Time since start:', new Date().getTime() - startTime, 'ms');
            

            await interaction.editOriginalMessage({
                embeds: [{
                    ...interaction.message.embeds[0],
                    image: { url: 'attachment://rotated_image.png' },
                }],  
            }, {
                    name: 'rotated_image.png',
                    file: Buffer.from(rotatedImage, 'base64')
            }
            );

        } catch (error) {
            console.error('Error rotating image:', error);
            await interaction.editOriginalMessage({
                content: '❌ An error occurred while rotating the image.',
                components: []
            });
        }
    }
});