module.exports.run = function (client, message, args) {
    const pool = require(`${process.cwd()}/db/connection.js`).pool;
    pool.getConnection(function(err, connection) {
        if (err) {message.channel.send(embeds.errorOccured(message, err));}
        let id;
        //args 0: operation, args 1: userid, args 2: amount, args 3: reason
        if (args.length < 1) {
            message.channel.send(embeds.invalidOrEmptyInput(message, "no arguments", "four arguments", "Argument order: OPERATION USERID AMOUNT REASON"));
            return false;
        }
        if (args.length < 2) {
            message.channel.send(embeds.invalidOrEmptyInput(message, "no user id", "an user id", "Mention or provide an ID"));
            return false;
        }
        let pointsOffset = args[2];
        if (/\D/gi.test(pointsOffset)) {
            message.channel.send(embeds.invalidOrEmptyInput(message, "an invalid amount", "an amount", "Try again, this is likely a typo. The amount should be a number ONLY."));
            return;
        }
        pointsOffset = parseInt(pointsOffset);


        let reason = message.content.slice(message.content.indexOf(args[3]));
        
        if (message.mentions.users.size >= 1 && args.length >= 2) {
            id = message.mentions.users.first().id;
        }
        else {
            if (typeof parseInt(args[1]) === "number") {
                id = args[1];
            }
        }
        if (id === undefined) {
            message.channel.send(embeds.invaildOrEmptyInput(message, "an invalid user", "a user", "Perhaps the user has left the guild, or you provided a wrong ID."));
            return false;
        }

        switch (args[0]) {
/*             case "set":
            case "s":
                if (args.length < 3) {
                    message.channel.send(embeds.providePointBalance(message, "set the point balance to"));
                    return;
                }
                checkIfUserExists((doesExist)=>{
                    if (!doesExist) {message.channel.send(embeds.userDoesntHaveColumn(message));}
                    
                    else {
                        modifyPoints(pointsOffset, reason);
                    }
                })
            break; */
            case "add":
            case "a":
                if (args.length < 3) {
                    message.channel.send(embeds.invalidOrEmptyInput(message, "no amount to add", "an amount to add", "Provide an amount to add."));
                    return;
                }
                if (args.length < 4) {
                    message.channel.send(embeds.invalidOrEmptyInput(message, "no reason", "a reason for modifying the points", "Provide a reason for modifying the points"));
                    return false;
                }
                checkIfUserExists((doesExist)=>{
                    if (!doesExist) {message.channel.send(embeds.userDoesntHaveColumn(message, id));}
                    
                    else {
                        //I don't know why, but it says balanceNow is redefined, even through the breaks; are working. Don't fix
                            getCurrentPoints((balanceNow)=>{

                            const newBalance = balanceNow + pointsOffset;
                            
                            modifyPoints(newBalance, reason, `+${pointsOffset}`);
                        });
                    }
                });
            break;
            case "r":
            case "remove": 

                if (args.length < 3) {
                    message.channel.send(embeds.invalidOrEmptyInput(message, "no amount", "an amount", "Provide an amount."));
                    return;
                }
                if (args.length < 4) {
                    message.channel.send(embeds.invalidOrEmptyInput(message, "no reason", "a reason", "Provide a reason for modifying the points"));
                    return false;
                }
                checkIfUserExists((doesExist)=>{
                    if (!doesExist) {message.channel.send(embeds.userDoesntHaveColumn(message, id));}
                    
                    else {
                        getCurrentPoints((balanceNow)=>{

                            const newBalance = balanceNow - pointsOffset;
                            
                            modifyPoints(newBalance, reason, `-${pointsOffset}`);
                        });
                    }
                });
            break;
            case "import":
            case "i":
                if (args.length < 3) {
                    message.channel.send(embeds.invalidOrEmptyInput(message, "no amount", "an amount to import the points as", "Provide an amount to set the point balance to"));
                    return;
                }

                checkIfUserExists((doesExist)=> {
                    if (doesExist) {                    
                        message.channel.send(embeds.userAlreadyHasColumn(message, id));
                        connection.release();
                        return;
                    }
                    connection.query(`INSERT INTO user VALUES (${connection.escape(id)}, ${connection.escape(pointsOffset)}, "[]", 0)`, 
                    (err, res)=>{
                        if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
                        message.channel.send(`:ok_hand: \`\`\`json\n${JSON.stringify(res)}\`\`\``);
                    });
                });
            break;
/*             case "reset":
                message.channel.send(`Are you sure you want to reset the points (and history) of ${id}?`).then((msg)=>{
                    msg.react(":white_check_mark:");
                    const collector = msg.createReactionCollector((reaction)=>{return reaction===":white_check_mark:"}, {time: 15000});
                    collector.on("collect", ()=>{
                        connection.query(`DELETE FROM user WHERE userid=${id}`, (err, res)=>{
                            if (err) {message.channel.send(embeds.errorOccured(message, err)); return}
                            else {
                                message.channel.send(`OK, deleted points and point history of ${id}. Use *modifypoints import to import them again`);
                            }
                        });
                    })
                }) */
            default:
                message.channel.send(embeds.invalidOrEmptyInput(message, "no operation", "an operation", "Operations: import, add or remove"));
            break;
        } 
        //returns whether user exists
        function checkIfUserExists (callback) { 
            connection.query(`SELECT * FROM user WHERE userid=${connection.escape(id)}`, (err, res)=>{
                if (err) {message.channel.send(embeds.errorOccured(message, err));}
                callback(res[0] !== undefined); 
            });
        }
        //TODO: make this a callback to fix the undefined10 problem
        function getCurrentPoints (callback) {
            connection.query(`SELECT points FROM user WHERE userid=${connection.escape(id)}`, (err, res)=>{
                if (err) {throw err;}
                const currentBalance = res[0].points;
                callback(currentBalance);
            });
        }
        function getCurrentHistory (callback) {
            connection.query(`SELECT history FROM user WHERE userid=${connection.escape(id)}`, (err, res) => {
                if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
                callback(res[0]);
            });
        }
        function modifyPoints (toWhat, why, amount) {
            getCurrentHistory((currentHistory)=>{
                const currentHistoryParsed = JSON.parse(currentHistory.history);
                const date = new Date();
                currentHistoryParsed.push({date: `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`, reason: why, amount: amount});
                const historyToInsert = JSON.stringify(currentHistoryParsed);
                connection.query(`UPDATE user SET points=?, history=? WHERE userid=${connection.escape(id)}`, [toWhat, historyToInsert], (err, res)=>{
                    if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
                    message.channel.send(embeds.addPointsOk(message, id, toWhat, reason));
                    connection.release();
                });
            });
        }        
    });
    return;
};

module.exports.info = {
    name: ["modify", "modifypoints", "m"],
    help: "Modify point balances",
    restriction: "Admins only",
    cooldown: 0,
    arguments: [
        ["Operation", "The operation to perform on the user's points"],
        ["User", "A mention to the user or their userid"],
        ["Amount", "The amount to add or remove"],
        ["Reason", "The reason for this operation"]
    ]
};


module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.admins.includes(message.author.id)) {return true;}
    else {return false;}
};
