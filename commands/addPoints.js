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
        if (!targetUser) {
            return message.reply("Debes mencionar a un usuario para agregar puntos.");
        }

        if (!args[1] || isNaN(args[1]) || parseInt(args[1]) <= 0) {
            return message.reply("Debes indicar una cantidad válida de puntos a agregar. Ejemplo: !add @usuario 50");
        }

        const pointsToAdd = parseInt(args[1]);

        try {
            // 🔹 SIEMPRE buscar los datos actualizados de la base de datos
            let userProfile = await profileModel.findOne({ 
                userId: targetUser.id,
                serverId: message.guild.id 
            });

            if (!userProfile) {
                userProfile = await profileModel.create({
                    userId: targetUser.id,
                    serverId: message.guild.id,
                    points: pointsToAdd
                });
            } else {
                // 🔹 Usar los datos FRESCOS de la base de datos, no el profileData del parámetro
                userProfile.points += pointsToAdd;
                await userProfile.save();
            }

            const embed = new EmbedBuilder()
                .setTitle("Puntos Agregados!!")
                .setDescription(`Se han agregado ${pointsToAdd} puntos a <@${targetUser.id}>.\nAhora tiene ${userProfile.points} puntos.`)
                .setColor(0x346beb)
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error("Error en comando add:", err);
            return message.reply("Ocurrió un error al procesar la solicitud.");
        }
    }
};