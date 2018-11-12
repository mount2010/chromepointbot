module.exports.run = function (client, message, args) {
    const meow = ['<3 kitty *gives pats*', 'meow!', 'meowww', 'oh you cute little kitty', 'https://imgs.xkcd.com/comics/cat_proximity.png', 'aww arent you a little furballlll', '*stroke stroke*', 'meooooow <3', '*puts you in lap and strokes* meow <3'];
    message.channel.send(meow[~~(Math.random() * meow.length)]);
    return;
};


module.exports.info = {
    name: ["meow"],
    help: "Meow meow meow, you are a cat, meow meow meow. (Yes, this is a joke.)",
    nohelp: true,
    cooldown: 10
};