module.exports = {
    name: "ping",
    description: "Replies with pong",
    execute(message, args) {
        message.channel.send({
            content: "Pong!",
        })
    }
};