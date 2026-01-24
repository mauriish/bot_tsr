// commands/clearall.js
module.exports = {
    name: "clearall",
    description: "Elimina todos los mensajes del canal (crea un canal nuevo)",
    async execute(message, args) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("No tienes permiso para usar este comando. Se requiere permisos de administrador.");
        }

        try {
            const channel = message.channel;
            const channelName = channel.name;
            const channelPosition = channel.position;
            const channelParent = channel.parent;
            const channelTopic = channel.topic;
            const channelNSFW = channel.nsfw;
            const channelRateLimit = channel.rateLimitPerUser;
            
            const responseMsg = await message.channel.send("Limpiando canal... Esto puede tomar unos segundos.");
            
            const newChannel = await channel.clone({
                name: channelName,
                position: channelPosition,
                parent: channelParent,
                topic: channelTopic,
                nsfw: channelNSFW,
                rateLimitPerUser: channelRateLimit,
                reason: `Clearall ejecutado por ${message.author.tag}`
            });
            
            await channel.delete();
            
            const finalResponse = await newChannel.send(`Canal limpiado por ${message.author.username}. Todos los mensajes han sido eliminados.`);
            
            setTimeout(() => {
                finalResponse.delete().catch(() => {});
            }, 5000);

        } catch (error) {
            console.error("Error al limpiar canal:", error);
            return message.reply("Ocurrió un error al limpiar el canal.");
        }
    }
};