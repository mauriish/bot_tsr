const { EmbedBuilder } = require("discord.js");
const roleConfigModel = require("../models/roleConfigSchema");

module.exports = {
    name: "setlicenserole",
    description: "Configura los roles para niveles de puntos",
    async execute(message, args) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("**No tienes permiso para usar este comando.**");
        }

        if (args.length < 2) {
            return message.reply("**Uso: !setlicenserole <puntos> <@rol|roleId>**");
        }

        const points = parseInt(args[0]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!role) {
            return message.reply("**Debes mencionar un rol válido o proporcionar su ID.**");
        }

        if (isNaN(points) || points < 0) {
            return message.reply("**Debes proporcionar una cantidad de puntos válida.**");
        }

        try {
            const serverConfig = await roleConfigModel.findOneAndUpdate(
                { serverId: message.guild.id },
                { 
                    $set: { 
                        [`roleLevels.${points}`]: role.id 
                    } 
                },
                { 
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true 
                }
            );

            const embed = new EmbedBuilder()
                .setTitle("**Rol de Licencia Configurado**")
                .setDescription("**Configuración guardada exitosamente**")
                .setColor(0x00FF00)
                .addFields(
                    { name: "**Puntos requeridos**", value: `**${points}**`, inline: true },
                    { name: "**Rol asignado**", value: `**${role.name}**`, inline: true }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error configurando rol:", error);
            await message.reply("**Ocurrió un error al configurar el rol.**");
        }
    }
};