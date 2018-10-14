const embeds = {
    commandNotFoundEmbed: function (command) {
        return {
            embed: {
                title: ":x: Command not found",
                description: `Command ${command} not found`,
                color: 0xff0000
            }
        }
    },
    allCommandsEmbed: function (fields) {
        return {
            embed: {
                title: ":information_source: Bot help",
                description: "List of all commands",
                fields: fields,
                color: 0x00ff00
            }
        };
    },
    commandEmbed: function (command, commandHelp) {
        return {
            embed: {
                title: `:information_source: Command: ${command}`,
                description: `${commandHelp}`,
                color: 0x00ff00
            }
        }
    },
    errorOccured: function (message, error) {
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
            fields.push({
                name: (Array.isArray(commands[i].name)?`${makeAliasNameSting(commands[i].name)}`:commands[i].name), 
                value: (commands[i].help === undefined?"No help specified":commands[i].help)+(commands[i].restriction !== undefined?` **${commands[i].restriction}**`:''),
            });
        }

        message.channel.send(embeds.allCommandsEmbed(fields));
    }
    else {
        const help = handler.getInfoFor(args[0]);
        if (!help.name) {
            message.channel.send(embeds.commandNotFoundEmbed(args[0]));
        }
        else {
            message.channel.send(embeds.commandEmbed(help.name, help.help));
        }
    }    
}

module.exports.info = {
    name: "help",
    help: "Display help for the bot"
}
