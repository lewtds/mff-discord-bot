#!/usr/bin/env ts-node

import { CONFIG } from './config';
import { Client, Intents, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { promisify } from "util";
import { HOP_AM_CHUAN_RESOLVER } from "./resolvers/hopamchuan";
import { getPuppetBrowser, ResolverModule } from "./resolver";

const wait = promisify(setTimeout);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', async () => {
    console.log('Connection to Discord ready!');

    console.log('Launching browser...');
    await getPuppetBrowser();
    console.log('Browser ready!');
});

const RESOLVERS = [
    HOP_AM_CHUAN_RESOLVER,
];

const BOT_COMMAND_REGEXP = /^!mff (.+)/;

client.on('messageCreate', async function(message) {
    const commandMatch = BOT_COMMAND_REGEXP.exec(message.content);
    if (!commandMatch) return;

    const commandText = commandMatch[1];

    // Match exact song URLs first
    for (const resolver of RESOLVERS) {
        if (resolver.matchSongUrl(commandText)) {
            return handleSongDirectMatch(message, resolver, commandText);
        }
    }

    // Then search by keyword
    // TODO parallelize this when we have multiple resolvers. Also think about ranking and stuff.
    for (const resolver of RESOLVERS) {

    }
});

async function handleSongDirectMatch(message: Message, resolver: ResolverModule, songUrl: string) {
    await message.channel.sendTyping();

    const songText = await resolver.getSongText(songUrl, 0);

    const reply = new MessageEmbed()
        .setTitle(songText.title)
        .setAuthor(songText.artist)
        // TODO Discord has a limit of 2000 chars. What to do with longer songs?
        .setDescription(songText.text.substring(0, 2000))
        .addField('Transpose', songText.transposition.toString());

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('transpose-up')
                .setLabel('♯')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('transpose-down')
                .setLabel('♭')
                .setStyle('PRIMARY'),
        );

    await message.reply({
        embeds: [reply],
        components: [row]
    });
}

// client.on('interactionCreate', async (interaction: Interaction) => {
//     if (!interaction.isCommand()) return;
//     console.log(interaction);
//
//     if (interaction.commandName === 'ping') {
//
//         const row = new MessageActionRow()
//             .addComponents(
//                 new MessageButton()
//                     .setCustomId('primary')
//                     .setLabel('Primary')
//                     .setStyle('PRIMARY'),
//             );
//
//         await interaction.reply({ content: 'Pong!', components: [row] });
//
//     }
// });

console.log('Connecting to Discord...');
client.login(CONFIG.DISCORD_TOKEN);
