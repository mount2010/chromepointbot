module.exports.run = function (client, message, args) {
    const pool = require(`${process.cwd()}/db/connection.js`).pool;
    
    pool.getConnection(function (error, connection) {
        if (error) throw error;
        connection.query(args.join(' '), function (err, result) {
            //don't throw error, this is mostly sql issues'
            connection.release();
            if (err) {message.channel.send(`Error: \n\`\`\`js\n${err}\`\`\``); return;};
            message.channel.send(`Result: \n\`\`\`json\n${JSON.stringify(result)}\`\`\` `); return;
        });
    })
}

module.exports.info = {
    name: "query",
    help: "Perform a query on the database.",
    restriction: "Developer/admin only",
    cooldown: 0,
    arguments: [
        ["Query", "The query to do on the database"]
    ]
}

module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.admins.includes(message.author.id)) {return true}
    else {return false}
}