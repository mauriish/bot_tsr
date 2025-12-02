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
        try {
            const command = require(`./commands/${file}`);
            commands.set(command.name, command);
            console.log(`Comando cargado: ${command.name}`);
        } catch (error) {
            console.error(`Error al cargar comando ${file}:`, error.message);
        }
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
        try {
            await commands.get(commandName).execute(message, args, profileData);
        } catch (error) {
            console.error(`Error ejecutando comando ${commandName}:`, error);
            await message.reply("Ocurrió un error al ejecutar el comando.");
        }
    }
});

// Evento ready
client.once('ready', () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
    console.log(`Conectado a ${client.guilds.cache.size} servidores`);
});

// Conectar a MongoDB
mongoose.connect(database)
    .then(() => console.log("Conectado a la base de datos"))
    .catch(error => console.error("Error de conexión a DB:", error));

// Conectar a Discord
client.login(token).catch(error => {
    console.error("Error al conectar con Discord:", error);
    process.exit(1);
});

// Servidor express para mantener activo
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para logs
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Endpoint principal
app.get("/", (req, res) => {
    res.send("Bot TSR activo - Sistema de puntos de licencia");
});

// Endpoint para UptimeRobot
app.get("/ping", (req, res) => {
    res.status(200).send("OK");
    console.log(`[${new Date().toLocaleTimeString()}] Ping recibido de UptimeRobot`);
});

// Endpoint de salud
app.get("/health", (req, res) => {
    const botStatus = client.isReady() ? "online" : "connecting";
    const botName = client.user?.tag || "conectando...";
    
    res.json({ 
        status: "operational",
        bot: botStatus,
        botName: botName,
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} segundos`,
        commands: Array.from(commands.keys())
    });
});

// Endpoint de info
app.get("/info", (req, res) => {
    res.json({
        name: "TSR Bot",
        description: "Sistema de puntos de licencia para TSR",
        endpoints: {
            root: "/",
            ping: "/ping (para UptimeRobot)",
            health: "/health",
            info: "/info"
        },
        url: "https://bot-tsr.onrender.com"
    });
});

// Manejar errores 404
app.use((req, res) => {
    res.status(404).send("Endpoint no encontrado");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`URL pública: https://bot-tsr.onrender.com`);
    console.log(`Endpoint para UptimeRobot: https://bot-tsr.onrender.com/ping`);
    console.log(`Endpoint de salud: https://bot-tsr.onrender.com/health`);
    console.log(`Ping automático configurado cada 4 minutos`);
});

// Ping automático interno cada 4 minutos (Render apaga después de 15 minutos de inactividad)
setInterval(() => {
    const now = new Date();
    console.log(`[${now.toLocaleTimeString()}] Ping automático interno`);
    
    if (client.isReady()) {
        console.log(`[${now.toLocaleTimeString()}] Bot activo: ${client.user.tag}`);
    }
}, 4 * 60 * 1000); // 4 minutos

// Manejar cierre limpio
process.on('SIGINT', () => {
    console.log('Recibida señal SIGINT. Cerrando...');
    client.destroy();
    process.exit(0);
});