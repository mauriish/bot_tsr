require('dotenv').config();
console.log("Token en env:", process.env.botK ? "DEFINIDO" : "NO DEFINIDO");
const express = require('express');
const db = require("@aoijs/aoi.db");
const { AoiClient } = require('aoi.js');

if (!process.env.botK) {
    console.error("La variable de entorno botK no está definida.");
    process.exit(1);
}

const client = new AoiClient({
    token: process.env.botK, 
    prefix: "!", 
    intents: ["MessageContent", "Guilds", "GuildMessages"],
    events: ["onMessage", "onInteractionCreate"],
    database: {
        type: "aoi.db",
        db: db,
        dbType: "KeyValue",
        tables: ["main", "racerstats"],
        securityKey: "a-32-characters-long-string-here"
    }
});

client.variables ({
    points: 0,
}, "racerstats")

client.loadCommands("./commands");

client.command({
    name: "ping",
    code: `Pong! $pingms`
});



const app = express();
app.get("/", (req, res) => res.send("Bot activo"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));

console.log("Bot iniciado");
