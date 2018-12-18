//spaghetti code right now, sorry
module.exports.run = function (client, message, args) {
    const db = require(`${process.cwd()}/db/connection.js`);
    const operation = args[0];
    let successMessage;
    let credits;
    let id;
    let reason;

    if (args.length < 1) {
        message.channel.send(embeds.invalidOrEmptyInput(message, "no operation", "an operation", "Do $help event for operations."));
        return;
    }
    switch (operation) {
        case "give":
        case "g":
            if (args.length < 2) {
                message.channel.send(embeds.invalidOrEmptyInput(message, "someone to give the credits to", "nothing", "Specify a user"));
                return;
            }
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
            if (args.length < 3) {message.channel.send(embeds.invalidOrEmptyInput(message, 'credits to give', 'no credit balance', "Try again - specify a credit amount as the third argument.")); return;}
            if (args[2].match("[^0-9]") !== null) {message.channel.send(embeds.invalidOrEmptyInput(message, "only numbers in the credits amount", "some non numeric characters in the input", "Try again - likely a typo.")); return;}

            credits = args[2];
            if (args.length < 4) {
                message.channel.send("You haven't specified a reason. Continue?").then((msg)=>{
                msg.react("✅")
                    .then(()=>{
                        msg.awaitReactions((react, user)=>{return react.emoji.name == "✅" && user.id === message.author.id;}, {max: 1}).then(()=>{
                            go();
                        });
                    });
                });
            }
            else {
                go();
            }
            //really cant think of a better name sorry
            function go () {
                if (args.length < 4) {reason = "from an event host that gave no reason";}
                else {reason = message.content.slice(message.content.indexOf(args[3]));}

        

                successMessage = `Success - deducted ${credits} credits from your balance and gave them to ${id}`;
                db.pool.getConnection(gotConnection);
            }
        break;
        default:
            message.channel.send(embeds.invalidOrEmptyInput(message, "a valid operation", "something else", "Do $help event for operations."));
    }
    function gotConnection (error, connection) {
        if (error) {message.channel.send(embeds.errorOccured(message, error)); return;}
        checkUserExists(connection);
    }

    function checkUserExists (connection) {
        connection.query(`SELECT * FROM user WHERE userid=${connection.escape(id)}`, (error, result)=>{
            if (error) {message.channel.send(embeds.errorOccured(message, error)); return;}
            if (!result || result.length < 1) {message.channel.send(embeds.userDoesntHaveColumn(message, id));}
            updateCredits(connection );
        });
    }
    function getCurrentPoints (connection, callback) {
        connection.query(`SELECT points FROM user WHERE userid=${connection.escape(id)}`, (err, res)=>{
            if (err) {throw err;}
            const currentBalance = res[0].points;
            callback(currentBalance);
        });
    }
    function updateCredits (connection) {
        connection.query(`SELECT credits FROM user WHERE userid=${connection.escape(message.author.id)}`, (err, res)=>{
            if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
            if (res[0].credits - credits <= 0) {message.channel.send("You have not enough credits to give."); return;}
            connection.query(`UPDATE user SET credits=${res[0].credits-credits} WHERE userid=${connection.escape(message.author.id)}`, (error)=> {
                if (error) {message.channel.send(embeds.errorOccured(message, error)); return;}
                getCurrentPoints(connection, (bal)=>{
                    modifyPoints(connection, parseInt(bal)+parseInt(credits), reason, credits);
                    success();
                });
            });
        });
    }
    function getCurrentHistory (connection, callback) {
        connection.query(`SELECT history FROM user WHERE userid=${connection.escape(id)}`, (err, res) => {
            if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
            callback(res[0]);
        });
    }
    //should probably make this a singular utility function. todo
    function modifyPoints (connection, toWhat, why, amount) {
        getCurrentHistory(connection, (currentHistory)=>{
            const currentHistoryParsed = JSON.parse(currentHistory.history);
            const date = new Date();
            currentHistoryParsed.push({date: `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`, reason: why, amount: '+' + amount});
            const historyToInsert = JSON.stringify(currentHistoryParsed);
            connection.query(`UPDATE user SET points=?, history=? WHERE userid=${connection.escape(id)}`, [toWhat, historyToInsert], (err, res)=>{
                if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
                connection.release();
            });
        });
    }     
    function success () {
        message.channel.send(successMessage || "No message - you should report this, this is supposed to output something (success())"); 
    }
};
module.exports.permission = function (message) {
    const hosts = require(`${process.cwd()}/eventHosts.json`);
    return hosts.hosts.indexOf(message.author.id) !== -1;
};
module.exports.info = {
    name: "event",
    help: "Manage, start, and give points as an event host",
    arguments: [
        ["operation", "Operation to perform for your event. Can be `give`."],
        ["user", "The person to give points to"],
        ["credits", "Amount of credits to give"],
        ["reason", "The reason for giving the credits."]
    ],
    restriction: "Event hosts only",
    cooldown: 0
};
