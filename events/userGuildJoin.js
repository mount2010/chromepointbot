const config = require(`${process.cwd()}/config.json`);
const day = new Date();
const defHistory = [{amount: `+${config.joinPoints}`, reason: 'Free 100 Points for Joining', date: `${day.getDate()}/${day.getMonth()+1}/${day.getFullYear()}` }];
const defaultHistory = JSON.stringify(defHistory);
let registered;

module.exports.register = ((bot)=>{
    const pool = require(`${process.cwd()}/db/connection.js`).pool;
    bot.on("guildMemberAdd", (member)=>{
        if (member.guild.id !== config.mainGuild) {return;}
        pool.getConnection((err, connection)=> {
            connection.query(`SELECT * FROM user WHERE userid=${member.id}`, (err, res) => {
                if (err) {member.send(`Something went wrong with initializing your points account. Please ask an admin to import your account: ${err}`);}
                if (res[0] !== undefined) {
                    member.send(`Welcome back, ${member.user.username}, your points are still at ${res[0].points}.`);
                }
                else {
                    connection.query(`INSERT INTO user (userid, points, history) VALUES ('${member.id}', ${config.joinPoints}, '${defaultHistory}')`, (error, res)=>{
                        if (error) {member.send(`Something went wrong with initializing your points account, please ask an admin to import your account: ${error}`);}
                        else {
                            if (process.argv[2] == "dev") {
                                member.send(embeds.guildMemberAddDev(member));
                            }
                            else {
                                member.send(embeds.guildMemberAdd(member));
                            }
                        }
                        console.log(`User ${member.user.username} joined, userid ${member.id}, DB ${JSON.stringify(res)}`);
                    });
                }
                connection.release();
            });
        });
    });
    registered = bot;
});