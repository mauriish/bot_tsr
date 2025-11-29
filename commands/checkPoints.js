const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    name: "points",
    aliases: ["pts"],
    description: "Muestra cuántos puntos tiene un usuario o tú mismo",
    async execute(message, args) {

        // Determinar usuario objetivo
        const targetUser = message.mentions.users.first() || message.author;

        // Buscar profileData del usuario objetivo
        let profileData;
        try {
            profileData = await profileModel.findOne({ userId: targetUser.id });

            // Si no existe perfil, solo entonces lo creamos
            if (!profileData) {
                profileData = await profileModel.create({
                    userId: targetUser.id,
                    serverId: message.guild.id,
                    points: 0
                });
            }
        } catch (err) {
            console.log(err);
            return message.reply("Ocurrió un error al cargar el perfil del usuario.");
        }

        // Asegurarnos de leer los puntos correctos
        const points = profileData.points ?? 0; // Si es undefined, poner 0
        const username = targetUser.username;

        const embed = new EmbedBuilder()
            .setTitle(`Licencia de piloto de **${username}**`)
            .setDescription(`**${username}** tiene ${profileData.points} puntos en su licencia`)
            .setColor(0x346beb);

        message.channel.send({ embeds: [embed] });
    }
};
