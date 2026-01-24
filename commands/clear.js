// commands/clear.js
module.exports = {
    name: "clear",
    aliases: ["purge", "clean"],
    description: "Elimina mensajes en el canal actual",
    async execute(message, args) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("No tienes permiso para usar este comando. Se requiere permisos de administrador.");
        }

        if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
            return message.reply("Debes especificar la cantidad de mensajes a eliminar. Ejemplo: !clear 50");
        }

        const amount = parseInt(args[0]);

        if (amount > 100) {
            return message.reply("No puedes eliminar más de 100 mensajes a la vez.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount + 1 });
            const filteredMessages = messages.filter(msg => !msg.pinned);
            
            const deleted = await message.channel.bulkDelete(filteredMessages, true);
            
            const response = await message.channel.send(`Se eliminaron ${deleted.size} mensajes.`);
            
            setTimeout(() => {
                response.delete().catch(() => {});
            }, 3000);

        } catch (error) {
            console.error("Error al eliminar mensajes:", error);
            
            if (error.code === 50034) {
                return message.reply("No se pueden eliminar mensajes con más de 14 días de antigüedad.");
            }
            
            return message.reply("Ocurrió un error al eliminar los mensajes.");
        }
    }
};