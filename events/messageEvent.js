let handler;
let registered;
const config = require(`${process.cwd()}/config.json`);

function message (message) {
    try {
        const prefix = config.prefix;
    /* 
        const meow = ['<3 kitty *gives pats*', 'meow!', 'meowww', 'oh you cute little kitty', 'https://imgs.xkcd.com/comics/cat_proximity.png', 'aww arent you a little furballlll', '*stroke stroke*', 'meooooow <3', '*puts you in lap and strokes* meow <3'];
        if (/(meow| purr| pat| mew| maw| meep)/gi.test(message.content) && message.author.id !== '272986016242204672') {message.channel.send(meow[~~(Math.random() * meow.length)])} 
    */
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
