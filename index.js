require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require("fs");
const commands = new Map();
const prefix = "!"



// Comprobar token
if (!process.env.botK) {
    console.error("La variable de entorno botK no está definida.");
    process.exit(1);
}

console.log("Token en env:", process.env.botK ? "DEFINIDO" : "NO DEFINIDO");

// Crear cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if(!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commands.has(commandName)) {
        commands.get(commandName).execute(message, args);
    }
});

// Evento ready
client.once('clientReady', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
});

// Command handler

fs.readdirSync('./commands')
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
      const cmd = require(`./commands/${file}`);
      commands.set(cmd.name, cmd);
  });

// Conectar con Discord
client.login(process.env.botK);

// Servidor Express para mantener el bot activo
const app = express();
app.get("/", (req, res) => res.send("Bot activo"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
