const fs = require("fs");
const db = require(`${process.cwd()}/db/connection.js`);
module.exports.run = function (client, message, args) {
    const operation = args[0];
    let id;
    let successMessage = '';
    const file = require(`${process.cwd()}/eventHosts.json`);
    const hosts = file.hosts;

    if (args.length < 1) {message.channel.send(embeds.invalidOrEmptyInput(message, "a operation", "no operation", "You can \`add\` or \`edit\` a host.")); return;}
    else if (args.length < 2) {message.channel.send(embeds.invalidOrEmptyInput(message, "a user", "no user", "Mention or provide a user ID")); return;}

    if (message.mentions.users.size >= 1) {
        id = message.mentions.users.first().id;
    }
    else {
        if (typeof parseInt(args[1]) === "number") {
            id = args[1];
        }
    }
    if (id === undefined) {
        message.channel.send(embeds.invalidOrEmptyInput(message, "an invalid ID", "a valid ID", "Try again."));
        return false;
    }
    if (args.length < 3) {message.channel.send(embeds.invalidOrEmptyInput(message, 'the credit balance to initiate this host with', 'no credit balance', "Try again - specify a credit amount as the third argument.")); return;}
    if (args[2].match("[^0-9]") !== null) {message.channel.send(embeds.invalidOrEmptyInput(message, "only numbers in the credits amount", "some non numeric characters in the input", "Try again - likely a typo.")); return;}
    const credits = parseInt(args[2]);

    switch (operation) {
        case 'add':
        case 'a':
            successMessage = `Successfully added ${id} as an event host, and gave them ${credits} credits.`;
            if (hosts.indexOf(id) !== -1) {
                message.channel.send("User already is a host.");
                return;
            }
            hosts.push(id);
            file.hosts = hosts;
            fs.writeFileSync(`${process.cwd()}/eventHosts.json`, JSON.stringify(file));
            db.pool.getConnection(gotConnection); 
        break;
        case 'edit':
        case 'e':
            successMessage = `Successfully edited ${id}'s credits to ${credits} credits.`;
            if (hosts.indexOf(id) === -1) {
                message.channel.send("User is not a host. Use $host add <id> <credits> to add them as a host.");
                return;
            }
            db.pool.getConnection(gotConnection);
        break;
        default:
            message.channel.send(embeds.invalidOrEmptyInput("a valid operation", "something else", "You can \`add\` or \`edit\` a host."));
            return;
    }
    function gotConnection (error, connection) {
        if (error) {message.channel.send(embeds.errorOccured(message, error)); return;}
        checkUserExists(connection);
    }
    function checkUserExists (connection) {
        connection.query(`SELECT * FROM user WHERE userid=${connection.escape(id)}`, (error, result)=>{
            if (error) {message.channel.send(embeds.errorOccured(message, error)); return;}
            if (!result || result.length < 1) {message.channel.send(embeds.userDoesntHaveColumn(message, id));}
            updateCredits(connection);
        });
    }
    function updateCredits (connection) {
        connection.query(`UPDATE user SET credits=${credits} WHERE userid=${connection.escape(id)}`, (error)=> {
            if (error) {message.channel.send(embeds.errorOccured(message, error)); return;}
            success();
        });
    }
    function success () {
        message.channel.send(successMessage || "No message - you should report this, this is supposed to output something (success())"); 
    }
};
module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.admins.includes(message.author.id)) {return true;}
    else {return false;}
};
module.exports.info = {
    name: "host",
    help: "Add a community event host",
    arguments: [
        ["operation", "Operation to perform on the user. May be \`add\` or \`edit\`"],
        ["user", "User to add as a community event host"],
        ["credits", "Credits to edit or add to this user"]
    ],
    restriction: "Admin only",
    cooldown: 0
};