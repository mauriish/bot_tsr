const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "help",
    aliases: ["comandos", "ayuda"],
    description: "Muestra todos los comandos disponibles",
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle("**Comandos del Bot TSR**")
            .setDescription("**Lista de todos los comandos disponibles:**")
            .setColor(0x346beb)
            .addFields(
                {
                    name: "**📊 Comandos de Puntos**",
                    value: 
                        "**!add @usuario <cantidad>** - Agrega puntos a un usuario\n" +
                        "**!remove @usuario <cantidad>** - Quita puntos a un usuario\n" +
                        "**!points @usuario (@ opcional) ** - Muestra los puntos de un usuario\n" +
                        "**!setup <auto>-<circuito>** - Descarga un setup desde Google Drive, requiere el rol de piloto\n", 
                    inline: false
                },
            )
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: `Solicitado por ${message.author.username}` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};