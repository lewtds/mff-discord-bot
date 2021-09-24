#!/usr/bin/env ts-node

import { CONFIG } from './config';
import { Client, Intents, Interaction, MessageActionRow, MessageButton } from "discord.js";

import { promisify } from "util";

const wait = promisify(setTimeout);

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', function(message) {
    console.log(message);
})

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    console.log(interaction);

    if (interaction.commandName === 'ping') {

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('primary')
                    .setLabel('Primary')
                    .setStyle('PRIMARY'),
            );

        await interaction.reply({ content: 'Pong!', components: [row] });

        // await interaction.deferReply();
        // await wait(4000);
        // await interaction.editReply('Pong!');

        // await interaction.reply({content: 'Địt mẹ anh em!', ephemeral: true});
        // await wait(2000);
        // await interaction.editReply('Pong again!');
    }
});

// Login to Discord with your client's token
client.login(CONFIG.DISCORD_TOKEN);
