require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require("mongoose");
const fs = require("fs");
const express = require('express');

const commands = new Map();
const prefix = "!";
const profileModel = require("./models/profileSchema");

const database = process.env.MONGODB_SRV;
const token = process.env.botK;

// Validar variables de entorno
if (!token) {
    console.error("La variable de entorno botK no está definida.");
    process.exit(1);
}

if (!database) {
    console.error("La variable MONGODB_SRV no está definida.");
    process.exit(1);
}

// Crear cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Cargar comandos
fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const command = require(`./commands/${file}`);
        commands.set(command.name, command);
    });

// Evento messageCreate
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Cargar o crear perfil del usuario
    let profileData;
    try {
        profileData = await profileModel.findOne({ 
            userId: message.author.id,
            serverId: message.guild.id 
        });

        if (!profileData) {
            profileData = await profileModel.create({
                userId: message.author.id,
                serverId: message.guild.id,
                points: 0
            });
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
        return;
    }

    // Ejecutar comando
    if (commands.has(commandName)) {
        commands.get(commandName).execute(message, args, profileData);
    }
});

// Evento ready
client.once('clientReady', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
});

// Conectar a MongoDB
mongoose.connect(database)
    .then(() => console.log("Conectado a la base de datos"))
    .catch(error => console.error("Error de conexión a DB:", error));

// Conectar a Discord
client.login(token);

// Servidor express
const app = express();
app.get("/", (req, res) => res.send("Bot activo"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));