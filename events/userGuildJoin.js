const config = require(`${process.cwd()}/config.json`);
const day = new Date();
const defHistory = [{amount: `+${config.joinPoints}`, reason: 'Free 100 Points for Joining', date: `${day.getDate() + '/'+ (day.getMonth()+1) + '/'+day.getFullYear()}` }];
const defaultHistory = JSON.stringify(defHistory);
const embeds = {
    guildMemberAdd: function (user) {
        return {embed: {
            title: `Welcome to the server, ${user.user.username}`,
            description: `Your points account has been created with ${config.joinPoints} starting points. \n For more information, check my help: ${config.prefix}help.`,
            image: {
                url: user.user.avatarURL
            },
            timestamp: new Date()
        }};
    }
};
let registered;

module.exports.register = ((bot)=>{
    const pool = require(`${process.cwd()}/db/connection.js`).pool;
    bot.on("guildMemberAdd", (member)=>{
        pool.getConnection((err, connection)=> {
            connection.query(`SELECT * FROM user WHERE userid=${member.id}`, (err, res) => {
                if (err) {member.send(`Something went wrong with initializing your points account. Please ask an admin to import your account: ${err}`);}
                if (res[0] !== undefined) {
                    member.send(`Welcome back, ${member.user.username}, your points are still at ${res[0].points}.`);
                }
                else {
                    connection.query(`INSERT INTO user (userid, points, history) VALUES (${member.id}, '${config.joinPoints}', '${connection.escape(defaultHistory)}')`, (error, res)=>{
                        if (error) {member.send(`Something went wrong with initializing your points account, please ask an admin to import your account: ${error}`);}
                        else {member.send(embeds.guildMemberAdd(member));}
                        console.log(`User ${member.user.username} joined, userid ${member.id}, DB ${JSON.stringify(res)}`);
                    });
                }
                connection.release();
            });
        });
    });
    registered = bot;
});