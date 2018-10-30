let handler;
let registered;
const config = require(`${process.cwd()}/config.json`);

function message (message) {
    try {
        const prefix = config.prefix;

        if (message.content.startsWith(prefix) && !message.author.bot) {
            const messageWithoutPrefix = message.content.slice(prefix.length);
            const messageSplit = messageWithoutPrefix.split(' ');
            const command = messageSplit[0];
            const args = messageSplit.slice(1);

            console.log(`(${new Date().toLocaleString()}) Command run: ${command}, arguments: ${args}, by ${message.author.tag} (${message.author.id})`);
            handler.run(command, registered, message, args);
        }
    }
    catch (err) {
        console.err(err);
    }
}

module.exports.register = function (bot) {
    bot.on('message', message);
    registered = bot;
}

module.exports.handler = function (newHandler) {
    handler = newHandler;
}
