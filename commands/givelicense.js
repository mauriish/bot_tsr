// commands/givelicense.js
const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const pointsConfig = require("../config/pointsconfig");

module.exports = {
    name: "givelicense",
    aliases: ["grantlicense"],
    description: "Da una licencia específica a un usuario",
    async execute(message, args) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("No tienes permiso para usar este comando.");
        }

        if (args.length < 2) {
            return message.reply("Uso: !givelicense @usuario <plata|oro|platino>");
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply("Debes mencionar a un usuario válido.");
        }

        const licenseType = args[1].toLowerCase();
        
        // Definir los niveles de licencia
        const licenseLevels = {
            "plata": { points: 0, roleId: "1442349282937147436", name: "Plata" },
            "oro": { points: 500, roleId: "1442350209958023198", name: "Oro" },
            "platino": { points: 1000, roleId: "1442350334193172570", name: "Platino" }
        };

        if (!licenseLevels[licenseType]) {
            return message.reply("Licencia no válida. Opciones: plata, oro, platino");
        }

        const license = licenseLevels[licenseType];
        const member = await message.guild.members.fetch(targetUser.id);

        try {
            // Actualizar puntos en la base de datos
            let userProfile = await profileModel.findOne({ 
                userId: targetUser.id,
                serverId: message.guild.id 
            });

            if (!userProfile) {
                userProfile = await profileModel.create({
                    userId: targetUser.id,
                    serverId: message.guild.id,
                    points: license.points
                });
            } else {
                userProfile.points = license.points;
                await userProfile.save();
            }

            // Remover todas las licencias anteriores
            const roleLevels = pointsConfig.getRoleLevels();
            const sortedLevels = Object.keys(roleLevels).sort((a, b) => b - a);

            for (const level of sortedLevels) {
                const roleId = roleLevels[level];
                if (roleId && member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                }
            }

            // Asignar la nueva licencia
            const newRole = message.guild.roles.cache.get(license.roleId);
            if (newRole && !member.roles.cache.has(license.roleId)) {
                await member.roles.add(license.roleId);
            }

            // Crear embed de confirmación
            const embed = new EmbedBuilder()
                .setTitle("Licencia Asignada")
                .setDescription(`Se ha asignado la licencia **${license.name}** a **${targetUser.username}**`)
                .setColor(licenseType === "platino" ? 0x4df9ff : licenseType === "oro" ? 0xd9b500 : 0x346beb)
                .addFields(
                    { name: "Usuario", value: targetUser.username, inline: true },
                    { name: "Licencia", value: license.name, inline: true },
                    { name: "Puntos asignados", value: `${license.points} puntos`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL({ format: 'png', dynamic: true }))
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error en comando givelicense:", error);
            await message.reply("Ocurrió un error al procesar la solicitud.");
        }
    }
};