const { EmbedBuilder } = require("@discordjs/builders");
const { Embed } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Shows the bot ping",
    execute(message, args) {
        const ping = Math.round(message.client.ws.ping); // Ping log

        const embed  = new EmbedBuilder()
        .setTitle("Pong!!")
        .setDescription(`Mi ping es **${ping}ms**`)
        .setColor(0xffffff)

        message.channel.send({ embeds: [embed] })
    }
};