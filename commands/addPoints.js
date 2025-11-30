const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const pointsConfig = require("../config/pointsconfig");

module.exports = {
    name: "add",
    description: "Adds points for a mentioned user",
    async execute(message, args, profileData) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("**No tienes permiso para usar este comando.**");
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply("**Debes mencionar a un usuario para agregar puntos.**");
        }

        if (!args[1] || isNaN(args[1]) || parseInt(args[1]) <= 0) {
            return message.reply("**Debes indicar una cantidad válida de puntos a agregar. Ejemplo: !add @usuario 50**");
        }

        const pointsToAdd = parseInt(args[1]);

        try {
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
                userProfile.points += pointsToAdd;
                await userProfile.save();
            }

            const member = await message.guild.members.fetch(targetUser.id);
            const newPoints = userProfile.points;
            const oldPoints = newPoints - pointsToAdd;
            
            const oldLevel = pointsConfig.getLevel(oldPoints);
            const newLevel = pointsConfig.getLevel(newPoints);
            const roleLevels = pointsConfig.getRoleLevels();

            // **DETERMINAR ROLES ACTUAL Y ANTERIOR**
            const getCurrentRoleId = (points) => {
                const sortedLevels = Object.keys(roleLevels).sort((a, b) => b - a);
                for (const level of sortedLevels) {
                    if (points >= parseInt(level)) {
                        return roleLevels[level];
                    }
                }
                return null;
            };

            const oldRoleId = getCurrentRoleId(oldPoints);
            const newRoleId = getCurrentRoleId(newPoints);

            // **GESTIONAR CAMBIOS DE ROLES - REMOVER Y ASIGNAR**
            let assignedRole = null;
            let removedRole = null;

            // **REMOVER ROL ANTERIOR SI ES DIFERENTE AL NUEVO**
            if (oldRoleId && oldRoleId !== newRoleId && member.roles.cache.has(oldRoleId)) {
                const oldRole = message.guild.roles.cache.get(oldRoleId);
                await member.roles.remove(oldRoleId);
                removedRole = oldRole;
            }

            // **ASIGNAR NUEVO ROL SI ES DIFERENTE AL ANTERIOR**
            if (newRoleId && newRoleId !== oldRoleId && !member.roles.cache.has(newRoleId)) {
                const newRole = message.guild.roles.cache.get(newRoleId);
                await member.roles.add(newRoleId);
                assignedRole = newRole;
            }

            // **CONSTRUIR EMBED**
            const embed = new EmbedBuilder()
                .setTitle("**Puntos Agregados!!**")
                .setDescription(`Se han agregado **${pointsToAdd}** puntos a <@${targetUser.id}>.\nAhora tiene **${newPoints}** puntos.`)
                .setColor(newLevel.color)
                .setThumbnail(targetUser.displayAvatarURL({ format: 'png', dynamic: true }))
                .setTimestamp();

            // **MOSTRAR NUEVA LICENCIA SI SE ASIGNÓ**
            if (assignedRole) {
                embed.addFields({
                    name: "**Nueva Licencia!!**",
                    value: `**¡Felicidades!** Has obtenido <@&${assignedRole.id}>`,
                    inline: true
                });
            }

            // **MOSTRAR SI SE REMOVIÓ UNA LICENCIA**
            if (removedRole && !assignedRole) {
                embed.addFields({
                    name: "**Licencia Removida**",
                    value: `Se removió <@&${removedRole.id}>`,
                    inline: true
                });
            }

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error("Error en comando add:", err);
            return message.reply("**Ocurrió un error al procesar la solicitud.**");
        }
    }
};