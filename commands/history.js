/*
We won't need ID for this! The ID is the index of the history record within the History array.
*/
module.exports.run = function (client, message, args) {
    const pool = require(`${process.cwd()}/db/connection.js`).pool;

    if (args.length < 1) {
        message.channel.send(embeds.invalidOrEmptyInput(message, "no arguments", "four arguments", "Argument order is $modifyhistory OPERATION USERID AMOUNT DATE HISTORY"));
        return false;
    }
    if (args.length < 2) {
        message.channel.send(embeds.invalidOrEmptyInput(message, "one argument", "four arguments", "Argument order is $modifyhistory OPERATION USERID AMOUNT DATE HISTORY"));
        return false;
    }

    let id;
 
    if (message.mentions.users.size >= 1 && args.length >= 2) {
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


    const operation = args[0];

    pool.getConnection(doOperation);
    function doOperation (err, connection) {
        if (err) {message.channel.send(embeds.errorOccured(message, err));}
        switch (operation) { 
            case "add":
            case "a":
                addCase(connection);
            break;
            case "remove": 
            case "r":
                removeCase(connection);
            break;
            default:
                message.channel.send(embeds.invalidOrEmptyInput(message, "no operation", "an operation for the user", "Try add or remove or import"));
            break;
        }
    }
    function removeCase (connection) {
        if (args.length < 3) {
            message.channel.send(embeds.invalidOrEmptyInput(message, "no history to remove", "a history ID", "Check the user's history ID in their $points. It is listed beside the points history"));
            return;
        }
        try {
            checkIfUserExists(connection, (doesExist)=> {
                if (!doesExist) {
                    message.channel.send(embeds.userDoesntHaveColumn(message, id));
                    connection.release();
                    return;
                }
                getCurrentHistory(connection, (history)=>{
                    if (history.history === []) {
                        message.channel.send("User doesn't have any points history");
                        return;
                    }
                    else {
                        doRemove(connection, history);
                    }
                });
            });
        }
        catch (err) {
            message.channel.send(embeds.errorOccured(message, err));
        }
    }
    function doRemove (connection, history) {
        const historyToRemove = JSON.parse(history)[args[2]];
                        
        if (!historyToRemove) {
            message.channel.send(`History with ID ${args[2]} does not exist`);
            return;
        }
        else {
            const historyToRemoveFrom = JSON.parse(history);
            historyToRemoveFrom.splice(args[2] ,1);
            const insertHistory = JSON.stringify(historyToRemoveFrom);

            connection.query(`UPDATE user SET history=${connection.escape(insertHistory)} WHERE userid=${connection.escape(id)}`, (err, res)=>{
                if (err) {throw err;}
                else {
                    message.channel.send(embeds.changeHistoryOk(message, JSON.stringify(historyToRemove), `Removed id ${args[2]}, `));
                    connection.release();
                    return;
                }
            });
        }
    }
    function addCase (connection) {
        if (args.length < 3) {
            message.channel.send(embeds.invalidOrEmptyInput(message, "no history to import", "an history to import", "Your argument order may be wrong, try doing the command again. Argument order: $modifyhistory OPERATION USERID AMOUNT DATE HISTORY"));
            return;
        }
        try {
            const amount = args[2];
            const date = args[3];
            const reason = message.content.slice(message.content.indexOf(args[4]));

            if (!(amount.startsWith("+") || amount.startsWith("-"))) {
                message.channel.send(embeds.invaildOrEmptyInput(message, "an invalid amount", "an amount that begins with + or -", "Try again."));
                return;
            }

            if (!reason || !amount || !date) {
                message.channel.send(embeds.invaildOrEmptyInput(message, "a not valid argument", "arguments in the order: $modifyhistory OPERATION USERID AMOUNT DATE HISTORY", "Try again."));
                connection.release();
                return;
            }
            checkIfUserExists(connection, (doesExist)=> {
                if (!doesExist) {                    
                    message.channel.send(embeds.userDoesntHaveColumn(message, id));
                    connection.release();
                    return;
                }
                getCurrentHistory(connection, (currentHistory)=>{
                    doAdd(connection, {amount, date, reason}, currentHistory);
                });
            });
        }
        catch (err) {
            console.log(err);
            message.channel.send(embeds.errorOccured(message, err));
            connection.release();
            return;
        }
    }
    function doAdd (connection, history, oldHistory) {
        let newHistory = JSON.parse(oldHistory);

        newHistory.push(history);

        const insertHistory = JSON.stringify(newHistory);
        
        connection.query(`UPDATE user SET history=${connection.escape(insertHistory)} WHERE userid=${connection.escape(id)}`, (err, res)=>{
            if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
            message.channel.send(embeds.changeHistoryOk(message, JSON.stringify(history), "Added"));
            connection.release();
        });
        //modifyHistory(JSON.stringify(currentHistory), "Added");
    }
    //returns whether user exists
    function checkIfUserExists (connection, callback) { 
        connection.query(`SELECT * FROM user WHERE userid=${connection.escape(id)}`, (err, res)=>{
            if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
            callback(res[0] !== undefined); 
        });
    }

    function getCurrentHistory (connection, callback) {
        connection.query(`SELECT history FROM user WHERE userid=${connection.escape(id)}`, (err, res) => {
            if (err) {message.channel.send(embeds.errorOccured(message, err)); return;}
            callback(res[0].history);
        });
    }

};

module.exports.info = {
    name: ["modifyhistory", "mh"], 
    help: "Modify the point history of someone",
    restriction: "Admin only",
    cooldown: 0,
    arguments: [
        ["Operation", "The operation to perform on the user's history. May be \`add\` or \`remove\` or \`import\`"], 
        ["Userid", "The user's userid or a mention to the user"],
        ["Amount", "The amount of points to modify with"],
        ["Date", "The date this history should be set to"],
        ["Reason", "The reason this history should be set to"]
    ]
};


module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.admins.includes(message.author.id)) {return true;}
    else {return false;}
};