module.exports.run = async function (client, message, args) {
    const pool = require(`${process.cwd()}/db/connection.js`).pool;
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
                if (message.guild.available) {
                    message.guild.fetchMember(args[0]).then((member)=>{
                        username = member.user.username;
                    }).catch(()=>{
                        username = args[0];
                    });
                }
                whosePoints = args[0];
            }
        }
        if (whosePoints === undefined) {
            message.channel.send("Invaild ID or mention");
            return;
        }
    }

    function parseHistory (historyJSON) {
        const history = JSON.parse(historyJSON);
        if (history[0] === undefined) {return undefined;}
        const pages = [];
        const numPages = Math.ceil(history.length/10);
        const remaindingFields = Math.floor(history.length % 10);

        for (let i = 0; i < numPages; i++) {
            const page = [];
            for (let j = 0; j < (i + 1 == numPages ? remaindingFields : 9); j++) {
                const k = j + (i * 10);
                page.push({
                    name: `[ID ${k}] ${history[k].amount} on ${history[k].date? history[k].date:"Unrecorded date"}`,
                    value: `for ${history[k].reason}`
                });
            }   
            pages.push(page);
        }
        return pages;
    }

    class Paginator {
        constructor (pagedHistory, result) {
            this.pagedHistory = pagedHistory || [];
            this.result = result;
            this.amountOfPages = this.pagedHistory.length - 1 || 0;
            this.page = 0;
            this.hasSent = false;
            this.sentMsg = {};
            this.queryTimeout = undefined;
        }
        async listenReactions (isARepeat = false) {
            try {
                const time = 20000;
                
                client.clearTimeout(this.queryTimeout);
                this.queryTimeout = client.setTimeout(()=>{
                    this.sentMsg.channel.send(`:clock: Query timed out after ${time/1000}s.`);
                }, time);
                const collected = await this.sentMsg.awaitReactions(
                        (reaction, user)=>{
                            return (reaction.emoji.name == '⬅' || reaction.emoji.name == '➡' || reaction.emoji.name == '❌') && user.id === message.author.id;
                        }, 
                        {max: 1, time}
                );
                this.reactHeard(collected);
            }
            catch (err) {
                console.log(err);
            }
        }
        reactHeard (collected) {
            if (collected.has('⬅')) {
                if (this.page - 1 < 0) {this.listenReactions(true); return;}
                this.page -= 1; 
                this.changePage();
            }
            else if (collected.has('➡')) {
                if (this.page + 1 > this.amountOfPages) {this.listenReactions(true); return;}
                this.page += 1; 
                this.changePage();
            }
            else if (collected.has('❌')) {
                message.channel.send(":x: Query canceled. I hope you got what you were looking for!");
                client.clearTimeout(this.queryTimeout);
                return;
            }
        }
        async changePage (change) {
            const credits = this.result[0].credits;
            let creditInfo = '';
            if (!!credits) {creditInfo = `This user is also an event host and has ${credits} credits left.`}
            const history = this.pagedHistory[this.page] ? this.pagedHistory[this.page] :  [{name: "No history", value:"This user has no points history"}];
            /* const embed = embeds.pointsEmbed(this.page, this.pagedHistory.length, message, username, whosePoints, history, this.result[0].points); */
            const embed = embeds.pointsEmbed(message, history, this.page+1, this.pagedHistory.length, username,  this.result[0].points, whosePoints == message.author.id, creditInfo);

            if (!this.hasSent) {this.sentMsg = await message.channel.send(embed); this.hasSent = true;}
            else {this.sentMsg = await this.sentMsg.edit(embed);}
            
            await this.sentMsg.react('⬅');
            await this.sentMsg.react('❌'); 
            await this.sentMsg.react('➡');
            this.listenReactions();
        }
    }


    
    try {
    pool.getConnection(function (error, connection) {
        if (error) {throw error;}
        connection.query(`SELECT * FROM user WHERE userid=${connection.escape(whosePoints)}`, function (error, result) {
            if (error) {throw error;}
            if (result.length === 0) {
                message.channel.send(`${whosePoints==message.author.id?'Your':'Their'} entry doesn't exist in the DB`);
                return;
            }
            else {
                const historyPaged = parseHistory(result[0].history);
                const paginator = new Paginator(historyPaged, result);
                paginator.changePage(0);
                connection.release();
            }
        });
    });
    }
    catch (err) {
        console.error(err);
        message.channel.send(embeds.errorOccured(message, err));
    } 
}
module.exports.info = {
    name: ["points", "$", "p"],
    help: "Display your Chrome giveaway points",
    cooldown: 3,
    arguments: [
        ["User", "The user's points to view"]
    ]
};