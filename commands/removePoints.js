const { EmbedBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const pointsConfig = require("../config/pointsconfig");

module.exports = {
    name: "remove",
    description: "Quita puntos a un usuario mencionado",
    async execute(message, args) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("**No tienes permiso para usar este comando.**");
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply("**Debes mencionar a un usuario para quitar puntos.**");
        }

        if (!args[1] || isNaN(args[1]) || parseInt(args[1]) <= 0) {
            return message.reply("**Debes indicar una cantidad válida de puntos a quitar. Ejemplo: !remove @usuario 50**");
        }

        const pointsToRemove = parseInt(args[1]);

        try {
            let userProfile = await profileModel.findOne({ 
                userId: targetUser.id,
                serverId: message.guild.id
            });
            
            if (!userProfile) {
                userProfile = await profileModel.create({
                    userId: targetUser.id,
                    serverId: message.guild.id,
                    points: 0
                });
            }

            const oldPoints = userProfile.points;
            userProfile.points = Math.max(oldPoints - pointsToRemove, 0);
            await userProfile.save();

            const member = await message.guild.members.fetch(targetUser.id);
            const newPoints = userProfile.points;
            
            const oldLevel = pointsConfig.getLevel(oldPoints);
            const newLevel = pointsConfig.getLevel(newPoints);
            const roleLevels = pointsConfig.getRoleLevels();
            const sortedLevels = Object.keys(roleLevels).sort((a, b) => b - a);

            let assignedRole = null;
            let removedRoles = [];

            // **REMOVER TODOS LOS ROLES QUE YA NO CORRESPONDEN**
            for (const level of sortedLevels) {
                const roleId = roleLevels[level];
                const role = message.guild.roles.cache.get(roleId);
                
                if (role && member.roles.cache.has(roleId) && newPoints < parseInt(level)) {
                    await member.roles.remove(roleId);
                    removedRoles.push(role);
                }
            }

            // **ASIGNAR EL ROL CORRESPONDIENTE AL NUEVO NIVEL (SOLO EL MÁS ALTO)**
            for (const level of sortedLevels) {
                if (newPoints >= parseInt(level)) {
                    const roleId = roleLevels[level];
                    const role = message.guild.roles.cache.get(roleId);
                    
                    if (role && !member.roles.cache.has(roleId)) {
                        await member.roles.add(roleId);
                        assignedRole = role;
                    }
                    break; // Solo asignar el rol más alto
                }
            }

            const embed = new EmbedBuilder()
                .setTitle("**Puntos Quitados**")
                .setDescription(`**${pointsToRemove} puntos** han sido removidos de **${targetUser.username}**.
                     Ahora tiene **${newPoints} puntos**.`)
                .setColor(newLevel.color)
                .setTimestamp();

            if (oldLevel.name !== newLevel.name) {
                embed.addFields({
                    name: "**Cambio de Nivel**",
                    value: `**${oldLevel.name}** -> **${newLevel.name}**`,
                    inline: true
                });
            }

            // **MOSTRAR ROLES REMOVIDOS SI HAY MÁS DE UNO**
            if (removedRoles.length > 0) {
                const removedRoleNames = removedRoles.map(role => `<@&${role.id}>`).join(', ');
                embed.addFields({
                    name: "**Licencias Removidas**",
                    value: `**Se removieron:** ${removedRoleNames}`,
                    inline: true
                });
            }

            // **MOSTRAR NUEVA LICENCIA SI SE ASIGNÓ**
            if (assignedRole) {
                embed.addFields({
                    name: "**Nueva Licencia**",
                    value: `**Se asignó:** <@&${assignedRole.id}>`,
                    inline: true
                });
            }

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error en comando remove:", error);
            await message.reply("**Ocurrió un error al procesar la solicitud.**");
        }
    }
};