module.exports.run = function (client, message, args) {
    const handler = require(`${process.cwd()}/bot.js`).handler;

    if (args.length < 1) {
        const commands = handler.getAllInfos();
        const fields = [];
        function makeAliasNameSting (arr) {
            let str = '';
            str+=arr[0];
            str+=' Aliases: '
            arr.forEach((value, index)=>{
                if (index === 0) {return;}
                else {str+=value+(index+1==arr.length?'':', ')}
            });
            return str;
        }
        for (let i = 0; i < commands.length; i++) {
            if (commands[i].nohelp) {continue}
            fields.push({
                name: (Array.isArray(commands[i].name)?`${makeAliasNameSting(commands[i].name)}`:commands[i].name), 
                value: (commands[i].help === undefined?"No help specified":commands[i].help)+(commands[i].restriction !== undefined?` **${commands[i].restriction}**`:''),
            });
        }

        message.channel.send(embeds.allCommandsEmbed(message, fields));
    }
    else {
        const help = handler.getInfoFor(args[0]);
        if (!help.name) {
            message.channel.send(embeds.commandNotFoundEmbed(message, args[0]));
        }
        else {
            message.channel.send(embeds.commandHelpEmbed(message, help.name, help.help));
        }
    }    
}

module.exports.info = {
    name: "help",
    help: "Display help for the bot",
    cooldown: 3
}
