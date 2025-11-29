const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    name: "remove",
    description: "Quita puntos a un usuario mencionado",
    async execute(message, args) {
        // Solo administradores pueden usarlo
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("No tienes permiso para usar este comando.");
        }

        // Usuario mencionado
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply("Debes mencionar a un usuario para quitar puntos.");
        }

        // Cantidad de puntos a quitar
        if (!args[1] || isNaN(args[1])) {
            return message.reply("Debes indicar la cantidad de puntos a quitar. Ejemplo: !remove @usuario 50");
        }

        const pointsToRemove = parseInt(args[1]);

        // Buscar o crear perfil del usuario mencionado
        let profileData;
        try {
            profileData = await profileModel.findOne({ userId: targetUser.id });
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

        // Quitar puntos sin que queden negativos
        profileData.points = Math.max((profileData.points || 0) - pointsToRemove, 0);

        try {
            await profileData.save();

            const embed = new EmbedBuilder()
                .setTitle(`Puntos Quitados`)
                .setDescription(`${pointsToRemove} puntos han sido removidos de <@${targetUser.id}>.\nAhora tiene ${profileData.points} puntos.`)
                .setColor(0x346beb);

            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.log(err);
            message.reply("Ocurrió un error al guardar los puntos.");
        }
    }
};
