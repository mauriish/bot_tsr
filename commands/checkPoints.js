const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");

module.exports = {
    name: "points",
    description: "Muestra cuántos puntos tiene un usuario",
    async execute(message, args, profileData) {

        // ⚠ Si por algún motivo profileData no llega, lo buscamos
        if (!profileData) {
            try {
                profileData = await profileModel.findOne({ userId: message.author.id });

                if (!profileData) {
                    profileData = await profileModel.create({
                        userId: message.author.id,
                        serverId: message.guild.id,
                    });
                }
            } catch (err) {
                console.log(err);
                return message.reply("Ocurrió un error al cargar tu perfil.");
            }
        }

        const { points } = profileData;
        const username = message.author.username;

        const embed = new EmbedBuilder()
        .setTitle(`Licencia de piloto de **${username}**`)
        .setDescription(`**${username}** tiene ${points} puntos en su licencia`)
        .setColor(0x346beb)

        message.channel.send({ embeds: [embed] })
    }
}
