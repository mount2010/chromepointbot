/*
We won't need ID for this! The ID is the index of the history record within the History array.
*/

const embeds = {
    provideSomebody: function (message) {
        return {embed: {
            title: "Please provide somebody to modify",
            description: "Mention or provide a ID",
            color: 0xff0000,
            footer: {text: message.author.username, icon_url: message.author.avatarURL}
        }}
    },
    invaildIDOrMention: function (message) {
        return {embed: {
            title: "Invaild ID or mention",
            color: 0xff0000,
            footer: {text: message.author.username, icon_url: message.author.avatarURL}
        }}
    },
    userAlreadyHasColumn: function (message) {
        return {embed: {
            title: "This user already has a column",
            description: "Use *modify set to modify it",
            color: 0xff0000
        }}
    },
    provideHistory: function (message, action) {
        return {embed: {
            title: `Please provide the history you want to ${action}`,
            color: 0xff0000,
            footer: {text: message.author.username, icon_url: message.author.avatarURL}
        }}
    },
    errorOccured: function (message, error) {
        console.error(`Non fatal error: ${JSON.stringify(error)}`);
        return {embed: {
            title: "An error occured",
            description: `Error:
            \`\`\`json
                ${JSON.stringify(error)}
            \`\`\``,
            color: 0xff0000
        }}
    },
    changeHistoryOk: function (message, history, action) {
        return {embed: {
            title: ":white_check_mark: Success",
            description: `${action} history ${JSON.stringify(history)}`,
            footer: {text: message.author.username, icon_url: message.author.avatarURL},
            timestamp: Date.now(),
            color:0x00ff00
        }}
    } ,
    tellMeWhatToDo: function (message) {
        return {embed: {
            title: ":question: Please tell me what to do",
            description: `Tell me what to do. Vaild things:** \`add, remove \`**`,
            footer: {text: message.author.username, icon_url: message.author.avatarURL},
        }}
    },
    userDoesntHaveColumn: function (message) {
        return {embed:{
            title: ":x: User doesn't have a column in the database",
            description: "Use *modify import to import a user",
            color: 0xff0000
        }}
    },
    invaildInput: function (message, warning) {
        return {embed: {
            title: ":x: Invaild input",
            description: warning,
            color: 0xff0000
        }}
    }

}
module.exports.run = function (client, message, args) {
    const pool = require(`${process.cwd()}/db/connection.js`).pool;

    if (args.length < 1) {
        message.channel.send(embeds.tellMeWhatToDo(message));
        return;
    }
    if (args.length < 2) {
        message.channel.send(embeds.provideSomebody(message));
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
        message.channel.send(embeds.invaildIDOrMention(message));
        return false;
    }


    const operation = args[0];

    pool.getConnection((err, connection) => {
        //returns whether user exists
        function checkIfUserExists (callback) { 
            connection.query(`SELECT * FROM user WHERE userid=${connection.escape(id)}`, (err, res)=>{
                if (err) {message.channel.send(embeds.errorOccured(message, err)); return}
                callback(res[0] !== undefined); 
            });
        }

        function getCurrentHistory (callback) {
            connection.query(`SELECT history FROM user WHERE userid=${connection.escape(id)}`, (err, res) => {
                if (err) {message.channel.send(embeds.errorOccured(message, err)); return}
                callback(res[0]);
            })
        }
        switch (operation) { 
            case "add":
            case "a":
                if (args.length < 3) {
                    message.channel.send(embeds.provideHistory(message, "import"));
                    return;
                }
                try {
                    const amount = args[2];
                    const date = args[3];
                    const reason = message.content.slice(message.content.indexOf(args[4]));

                    if (!(amount.startsWith("+") || amount.startsWith("-"))) {
                        message.channel.send(embeds.invaildInput(message, "Make sure amount starts with + or - (Argument order: Amount, date, reason)"))
                        return;
                    }

                    if (!reason || !amount || !date) {
                        message.channel.send(embeds.invaildInput(message, "Make sure input has arguments in this order: amount, date, reason"));
                        connection.release();
                        return;
                    }
                    checkIfUserExists((doesExist)=> {
                        if (!doesExist) {                    
                            message.channel.send(embeds.userDoesntHaveColumn(message));
                            connection.release();
                            return;
                        }
                        getCurrentHistory((currentHistory)=>{
                            const history = {date, reason, amount};
                            let historyCurrentIdToInsert;
                            let newHistory = JSON.parse(currentHistory.history);

                            newHistory.push(history);

                            const insertHistory = JSON.stringify(newHistory);
                            
                            connection.query(`UPDATE user SET history=${connection.escape(insertHistory)} WHERE userid=${connection.escape(id)}`, (err, res)=>{
                                if (err) {message.channel.send(embeds.errorOccured(message, err)); return}
                                message.channel.send(embeds.changeHistoryOk(message, insertHistory, "Added"));
                            })
                            //modifyHistory(JSON.stringify(currentHistory), "Added");
        

                        })
                    })
                }
                catch (err) {
                    console.log(err);
                    message.channel.send(embeds.errorOccured(message, err));
                    connection.release();
                    return;
                }


            break;
            case "remove": 
            case "r":
                if (args.length < 3) {
                    message.channel.send(embeds.provideHistory(message, "remove, using the ID provided when you check their *points"));
                    return;
                }
                try {
                    checkIfUserExists((doesExist)=> {
                        if (!doesExist) {
                            message.channel.send(embeds.userDoesntHaveColumn(message));
                            connection.release();
                            return;
                        }
                        getCurrentHistory((history)=>{
                            if (history.history === []) {
                                message.channel.send("User doesn't have any points history");
                                return;
                            }
                            else {
                                const historyToRemove = JSON.parse(history.history)[args[2]];
                                
                                if (!historyToRemove) {
                                    message.channel.send(`History with ID ${args[2]} does not exist`);
                                    return;
                                }
                                else {
                                    const historyToRemoveFrom = JSON.parse(history.history);
                                    historyToRemoveFrom.splice(args[2] ,1);
                                    const insertHistory = JSON.stringify(historyToRemoveFrom);

                                    connection.query(`UPDATE user SET history=${connection.escape(insertHistory)} WHERE userid=${connection.escape(id)}`, (err, res)=>{
                                        if (err) {throw err}
                                        else {
                                            message.channel.send(`Removed ${JSON.stringify(historyToRemove)}, id ${args[2]}`);
                                            return;
                                        }
                                    })
                                }
                            }
                        })
                    })
                }
                catch (err) {
                    message.channel.send(errorOccured(message, error));
                }
            break;
            default:
                message.react(":question:");
            break;
        }
    });

}

module.exports.info = {
    name: ["modifyhistory", "mh"], 
    help: "Modify the point history of someone",
    restriction: "Admin only"
}


module.exports.permission = function (message) {
    const config = require(`${process.cwd()}/config.json`);
    if (config.admins.includes(message.author.id)) {return true}
    else {return false}
}