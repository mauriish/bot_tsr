const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    name: "points",
    aliases: ["pts"],
    description: "Muestra cuántos puntos tiene un usuario o tú mismo",
    async execute(message, args) {
        // Determinar usuario objetivo
        let targetUser = message.mentions.users.first();

        if (!targetUser && args[0]) {
            targetUser = await message.client.users.fetch(args[0]).catch(() => null);
        }

        if (!targetUser) targetUser = message.author;

        // Buscar profileData del usuario objetivo
        let profileData;
        try {
            // 🔹 CORREGIDO: Incluir serverId en la búsqueda
            profileData = await profileModel.findOne({ 
                userId: targetUser.id,
                serverId: message.guild.id  // 🔹 ESTA LÍNEA ES CLAVE
            });

            // Si no existe perfil, crearlo
            if (!profileData) {
                profileData = await profileModel.create({
                    userId: targetUser.id,
                    serverId: message.guild.id,  // 🔹 Y también aquí
                    points: 0
                });
            }
        } catch (err) {
            console.log(err);
            return message.reply("Ocurrió un error al cargar el perfil del usuario.");
        }

        const embed = new EmbedBuilder()
            .setTitle(`Licencia de piloto de **${targetUser.username}**`)
            .setDescription(`**${targetUser.username}** tiene ${profileData.points} puntos en su licencia`)
            .setColor(0x346beb);

        message.channel.send({ embeds: [embed] });
    }
};