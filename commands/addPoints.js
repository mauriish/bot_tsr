const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    name: "add",
    description: "Adds points for a mentioned user",
    async execute(message, args, profileData) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("No tienes permiso para usar este comando.");
        }

        const targetUser = message.mentions.users.first();
        if(!targetUser) {
            return message.reply("Debes mencionar a un usuario para agregar puntos.");
        }

        if (!args[1] || isNaN(args[1])) {
            return message.reply("Debes indicar la cantidad de puntos a agregar. Ejemplo: !add @usuario 50");
        }

        const pointsToAdd = parseInt(args[1]);

        // Buscar o crear perfil del usuario mencionado
        if (!profileData) {
            try {
                profileData = await profileModel.findOne({ userId: targetUser.id });

                if (!profileData) {
                    profileData = await profileModel.create({
                        userId: targetUser.id, // 🔹 CORREGIDO
                        serverId: message.guild.id,
                        points: 0
                    });
                }
            } catch (err) {
                console.log(err);
                return message.reply("Ocurrió un error al cargar el perfil.");
            }
        }

        // Sumar puntos
        profileData.points = (profileData.points || 0) + pointsToAdd;
        await profileData.save(); // 🔹 MUY IMPORTANTE: guardar cambios en la DB

        const embed = new EmbedBuilder()
            .setTitle(`Puntos Agregados!!`)
            .setDescription(`Se han agregado ${pointsToAdd} puntos a <@${targetUser.id}>.\nAhora tiene ${profileData.points}`)
            .setColor(0x346beb);

        message.channel.send({ embeds: [embed] });
    }
};
