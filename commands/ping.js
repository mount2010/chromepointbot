module.exports.run = function (client, message, args) {
    const ping = ~~client.ping;
    message.channel.send(`Pong, ${ping}ms (to Discord servers, not client lag!)`);
}
module.exports.info = {
    name: "ping",
    help: "Display the ping to Discord servers",
    cooldown: 10
}