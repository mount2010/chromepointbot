module.exports.run = function (client, message, args) {
    //jshint evil:true
    //Developer only, it's fine. (Unless the trusted user breaks it...)
    message.channel.send("Result: \n"+eval(args.join(' '))); 
};

module.exports.info = {
    name: ["eval"],
    help: "Evaluate some JS",
    restriction: "Developer/admin only",
    cooldown: 0,
    arguments: [
        ["Code", "JS to be evalulated"]
    ]
};


module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.developer.id.includes(message.author.id)) {return true;}
    else {return false;}
};