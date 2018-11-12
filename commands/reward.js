module.exports.run = function (client, message, args) {
    
};
module.exports.info = {
    name: "reward",
    help: "Manage rewards",
    restriction: "Admins only.",
    cooldown: 0
};


module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.admins.includes(message.author.id)) {return true;}
    else {return false;}
};
