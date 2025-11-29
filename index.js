require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require("mongoose");
const fs = require("fs");
const commands = new Map();
const prefix = "!";
const profileModel = require("./models/profileSchema");

const { MONGODB_SRV: database } = process.env;

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

// CARGAR COMANDOS
fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const cmd = require(`./commands/${file}`);
        commands.set(cmd.name, cmd);
    });

// ÚNICO EVENTO messageCreate (NO DUPLICADO)
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // CARGAR O CREAR PROFILEDATA AQUÍ
    let profileData;
    try {
        profileData = await profileModel.findOne({ userId: message.author.id });

        if (!profileData) {
            profileData = await profileModel.create({
                userId: message.author.id,
                serverId: message.guild.id,
                points: 0,
            });
        }
    } catch (err) {
        console.log(err);
    }

    if (commands.has(commandName)) {
        commands.get(commandName).execute(message, args, profileData);
    }
});

// Evento ready
client.once('clientReady', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
});

// Conectar con MongoDB
mongoose.connect(database)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

// Conectar con Discord
client.login(process.env.botK);

// Servidor express para mantener activo
const app = express();
app.get("/", (req, res) => res.send("Bot activo"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
