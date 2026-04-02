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
                        "**!points @usuario (@ opcional)** - Muestra los puntos de un usuario\n",
                    inline: false
                },
                {
                    name: "**🏁 Comandos de Setups** *(requiere rol de piloto)*",
                    value:
                        "**!setup <auto>-<circuito>** - Descarga un setup desde Google Drive\n" +
                        "**!circuitos** - Muestra todos los circuitos disponibles\n" +
                        "**!autos <circuito>** - Muestra los autos disponibles en un circuito\n",
                    inline: false
                },
            )
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: `Solicitado por ${message.author.username}` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};