module.exports.run = function (client, message, args) {
    message.channel.send("Result: \n"+eval(args.join(' ')));
}

module.exports.info = {
    name: ["eval"],
    help: "Evaluate some JS",
    restriction: "Admins only"
}


module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.admins.includes(message.author.id)) {return true}
    else {return false}
}