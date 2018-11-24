module.exports.run = function (client, message, args) {
    message.channel.send(embeds.infoEmbed(message));
};
module.exports.info = {
    name: "info",
    help: "Displays information about me",
    cooldown: 0
};