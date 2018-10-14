const embeds = {
    pointsEmbed: function (message, username, userId, history, points) {
        return {
            embed: {
                title: `${username}'s points`,
                description: `${userId===message.author.id?'You':'They'} have ${points} points.`,
                fields: history===undefined?[{name: "No history", value:"This user has no points history"}]:history,
                color: 0x00ff00
            }
        }
    },
    errorOccured: function (message, error, config) {
        return {embed:{
            title: "An error occured.",
            color: 0xff0000,
            description: `An unknown error occured. Please report this to ${config.admin.username}`,
            fields: [{
                name: "Error details",
                value: `\`\`\`${error}\`\`\``
            }],
            footer: {
                text: `${message.author.username}`,
                icon_url: `${message.author.avatarURL}`
            },
            timestamp: Date.now()
        }}
    }
}
module.exports.run = async function (client, message, args) {
    const pool = require(`${process.cwd()}/db/connection.js`).pool;
    const config = require(`${process.cwd()}/config.json`);
    let whosePoints;
    let username;
    if (args.length < 1) {
        whosePoints = message.author.id;
        username = message.author.username;
    }
    else {
        if (message.mentions.users.size >= 1 && args.length >= 1) {
            whosePoints = message.mentions.users.first().id;
            username = message.mentions.users.first().username;
        }
        else {
            if (typeof parseInt(args[0]) === "number") {
                whosePoints = args[0];
                username = args[0]; //Lies, but this is not important, only for the embed
            }
        }
        if (whosePoints === undefined) {
            message.channel.send("Invaild ID or mention");
            return;
        }
    }

    function parseHistory (historyJSON) {
        const history = JSON.parse(historyJSON);
        if (history[0] === undefined) {return undefined}
        const fields = [];
        for (let i = 0; i < history.length; i++) {
            fields.push({
                name: `[ID ${i}] ${history[i].amount} on ${history[i].date? history[i].date:"Unrecorded date"}`,
                value: `for ${history[i].reason}`
            })
        }   
        return fields;
    }
    try {
    pool.getConnection(function (error, connection) {
        if (error) {throw error}
        connection.query(`SELECT * FROM user WHERE userid=${connection.escape(whosePoints)}`, function (error, result) {
            if (error) {throw error}
            if (result.length === 0) {
                message.channel.send(`${whosePoints==message.author.id?'Your':'Their'} entry doesn't exist in the DB`);
                return;
            }
            else {
                message.channel.send(embeds.pointsEmbed(message, username, whosePoints, parseHistory(result[0].history), result[0].points));
            }
        })
    });
    }
    catch (err) {
        console.error(err);
        message.channel.send(embeds.errorOccured(message, err, config));
    } 
}
module.exports.info = {
    name: ["points", "$", "p"],
    help: "Display your Chrome giveaway points"
}