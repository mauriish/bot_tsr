require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

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

// Evento ready
client.once('ready', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
});

// Comando !ping
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === "!ping") {
        message.reply(`Pong!`);
    }
});

// Conectar con Discord
client.login(process.env.botK);

// Servidor Express para mantener el bot activo
const app = express();
app.get("/", (req, res) => res.send("Bot activo"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
