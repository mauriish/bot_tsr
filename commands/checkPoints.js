const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const pointsConfig = require("../config/pointsconfig");

module.exports = {
    name: "points",
    aliases: ["pts"],
    description: "Muestra cuántos puntos tiene un usuario o tú mismo",
    async execute(message, args) {
        let targetUser = message.mentions.users.first();

        if (!targetUser && args[0]) {
            targetUser = await message.client.users.fetch(args[0]).catch(() => null);
        }

        if (!targetUser) {
            targetUser = message.author;
        }

        let profileData;
        try {
            profileData = await profileModel.findOne({ 
                userId: targetUser.id,
                serverId: message.guild.id
            });

            if (!profileData) {
                profileData = await profileModel.create({
                    userId: targetUser.id,
                    serverId: message.guild.id,
                    points: 0
                });
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
            return message.reply("Ocurrió un error al cargar el perfil del usuario.");
        }

        const userLevel = pointsConfig.getLevel(profileData.points);

        const embed = new EmbedBuilder()
            .setTitle(`**Licencia de piloto de ${targetUser.username}**`)
            .setDescription(`**${targetUser.username}** tiene **${profileData.points} puntos** en su licencia`)
            .setColor(userLevel.color)
            .addFields(
                { 
                    name: "**Nivel de Licencia**", 
                    value: `**${userLevel.name}**`, 
                    inline: true 
                },
                { 
                    name: "**Puntos Totales**", 
                    value: `**${profileData.points} puntos**`, 
                    inline: true 
                }
            )
            .setThumbnail(targetUser.displayAvatarURL({ format: 'png', dynamic: true }))
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};