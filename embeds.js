const Discord = require("discord.js");
const config = require(`${process.cwd()}/config.json`);

function embedBase (message, isSuccess) {
    const embed = new Discord.RichEmbed()
    .setColor(isSuccess ? "#00ff00" : "#ff0000")
    .setFooter(process.argv[2] == "dev" ? `[Developer Mode] ${message.author.username}` : message.author.username, message.author.avatarURL)
    .setTimestamp(new Date());
    return embed;
}

function emojiEmbedBase (message, title, emoji, isSuccess) {
    const embed = embedBase(message, isSuccess);
    embed.setTitle(`${emoji} ${title}`);
    return embed;
}

global.embeds = {
    /**
     * Embed for the $points command to show the information needed
     * (Gee, the amount of arguments. Pop a PR if you know what I need here!)
     * 
     * @argument {Discord.message} message the Discord message sent as the command
     * @argument {object[]} page the Embed fields for the page the user is viewing
     * @argument {number} pageNumber the page number the user is viewing
     * @argument {number} pageTotal the total number of pages this user has
     * @argument {string} whosePoints the user whose points are being viewed
     * @argument {number} points the amount of points this user has
     * @argument {boolean} isUserSame is the user being viewed the same as the one running the command?
     */
    pointsEmbed: function (message, page, pageNumber, pageTotal, whosePoints, points, isUserSame) {
        const embed = emojiEmbedBase(message, `${whosePoints}'s points`, ":1234:", true).setDescription(`${isUserSame?'You':'They'} have ${points} points.\n**Page ${pageNumber}/${pageTotal}**`);
        embed.fields = page;
        return embed;
    },
    /**
     * Embed for whenever an error occurs
     * 
     * @argument {Discord.message} message The Discord message this command was ran with
     * @argument {Error} err error that happened
     */
    errorOccured: function (message, err) {
        return emojiEmbedBase(message, "An error occured", ":x:", false).setDescription(`Please report this to ${config.developer.username}: \`\`\`${err}\`\`\``);  
    },
    /**
     * Embed for invaild or empty input (i.e. wrong arguments)
     * 
     * @argument {Discord.message} message The Discord message this command was ran with
     * @argument {string} invaild The invaild input that was rejected
     * @argument {string} expected An expected value for the input
     * @argument {string} advice Some advice for the user (e.g. the argument order)
     */
    invalidOrEmptyInput: function (message, invalid, expected, advice) {
        return emojiEmbedBase(message, "Invaild input", ":warning:", false).setDescription(`Got ${invalid}, expected ${expected}. ${advice}`);
    },
    /**
     * Embed for when the history is successfully modified
     * 
     * @argument {Discord.message} message The Discord message this command was ran with
     * @argument {string} history The JSON stringified object of the history that was modified
     * @argument {string} action The modification action that was carried out
     */
    changeHistoryOK: function (message, history, action) {
        return emojiEmbedBase(message, `Success`, ":ok_hand:", true).setDescription(`${action} \`${history}\` successfully`);
    },
    /**
     * Embed for listing all the commands for the bot
     * 
     * @argument {Discord.message} message The DIscord message this command was ran with
     * @argument {string[]} fields The fields for the embed
     */
    allCommandsEmbed: function (message, fields) {
        const embed = emojiEmbedBase(message, "Listing of all commands", ":newspaper:", true);
        embed.fields = fields;
        return embed;
    },
    /**
     * Embed for listing a specific command's help
     * 
     * @argument {Discord.message} message The Discord message this command was ran with
     * @argument {string} name The command being queried
     * @argument {string} help The help for this command
     */
    commandHelpEmbed: function (message, name, help) {
        return emojiEmbedBase(message, `Help for ${name}`, ":information_source:", true).setDescription(help);
    },
    /**Embed for when a command is not found
     * 
     * @argument {Discord.message} message The Discord message this command was ran with
     * @argument {string} name The command being queried that is not found
     */
    commandNotFoundEmbed: function (message, name) {
        return emojiEmbedBase(message, `${name} doesn't exist`, ":x:", false).setDescription(`${name} does not exist. Do \`$help\` for all commands.`);
    },
    userDoesntHaveColumn: function (message, user) {
        return emojiEmbedBase(message, `${user}'s id doesn't exist inside the database`, ":x:", false);
    },
    addPointsOk: function (message, user, newBalance, reason) {
        return emojiEmbedBase(message, `Success`, `:white_check_mark:`, true).setDescription(`Changed ${user}'s balance to ${newBalance} with reason ${reason}`);
    },
    userAlreadyHasColumn: function (message, user) {
        return emojiEmbedBase(message, `${user} already has a column`, `:x:`, false).setDescription("Use $modify add or $modify remove to modify their points");
    },
    guildMemberAdd: function (user) {
        return new Discord.RichEmbed().setTitle(`:wave: Welcome to the server, ${user.user.username}`).setColor("#00ff00")
        .setDescription(`Your points account has been created with ${config.joinPoints} starting points. \n For more information, check my help: ${config.prefix}help.`)
        .setImage(user.user.avatarURL);
    },
    cooldown: function (message, cooldown, command) {
        return emojiEmbedBase(message, `That command is on cooldown, please hold on.`, ":clock:", false).setDescription(`Please wait ${Math.ceil(cooldown/1000)}s to use ${command}.`);
    },
    noPermissionEmbed: function (message, command, restriction) {
        return emojiEmbedBase(message, `You don't have permission to use ${command}.`, ":x:", false).setDescription(`${command} has ${restriction} restriction.`);
    },
    commandDoesntExistError: function (message, command) {
        return emojiEmbedBase(message, `${command} does not exist`, ":x:", false).setDescription(`Do ${config.prefix}help for help.`);
    } 
}