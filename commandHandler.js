const fs = require('fs');
const config = require(`${process.cwd()}/config.json`);

const embeds = {
    commandDoesntExistError: function (message) {return {embed:{
        title: "Command doesn't exist.",
        color: 0xff0000,
        description: `That command does not exist. Do \`${config.prefix}help\` for help.`,
        footer: {
            text: `${message.author.username}`,
            icon_url: `${message.author.avatarURL}`
        },
        timestamp: Date.now()
    }}},
    errorOccured: function (message, error) {
        return {embed:{
            title: "An error occured.",
            color: 0xff0000,
            description: `An unknown error occured.`,
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
    },
    noPermissionEmbed: function (message) {
        return {embed: {
            title: ":x: You don't have permission to do that!",
            color: 0xff0000,
            footer: {
                text: `${message.author.username}`,
                icon_url: `${message.author.avatarURL}`
            }
        }}
    }
}

class CommandHandler {
    constructor () {
        this.commands = new Map();
    }
    registerCommand (commandFileLink) {
        const command = require(`${process.cwd()}/${commandFileLink}`);
        if (command.info === undefined) {console.log(`${commandFileLink} has no info value, will skip`); return;}
        if (command.info.name === undefined) {console.log(`${commandFileLink} has no name, will skip`)}
        if (Array.isArray(command.info.name)) {
            for (let i = 0; i < command.info.name.length; i++) {
                if (!this.commands.has(command.info.name[i])) {this.commands.set(command.info.name[i], command);}
                else {console.log(`Duplicate alias/name for ${commandFileLink} "${command.info.name[i]}" `)}
            }
        }
        else {
            this.commands.set(command.info.name, command);
        }
   }
    registerCommandsIn (folder) {
        const files = fs.readdirSync(folder);
        for (let i = 0; i < files.length; i++) {
            this.registerCommand(`${folder}/${files[i]}`);
        }
    }
    getAllInfos () {
        const infos = [];
        const keysToIgnore = []; //for aliases, idk what im doing
        this.commands.forEach((value, key, map) => {
            if (!keysToIgnore.includes(key)) {
                if (Array.isArray(value.info.name)) {
                    keysToIgnore.push(...value.info.name);
                    infos.push(value.info);
                }
                else {infos.push(value.info);}
            }
        })
        return infos;
    }
    getInfoFor (command) {
        return (this.commands.has(command)?this.commands.get(command).info:{});
    }
    run (what, client, message, args) {
        try {
            if (this.commands.has(what)) {
                //check for permissions
                if (this.commands.get(what).permission) {
                    if (this.commands.get(what).permission(message)) {
                        this.commands.get(what).run(client, message, args);
                    }
                    else {
                        message.channel.send(embeds.noPermissionEmbed(message));
                    }
                }
                else {
                    this.commands.get(what).run(client, message, args);
                }
            }
            else {
                message.channel.send(embeds.commandDoesntExistError(message));
            }
        }
        catch (err) {
            console.error(err);
            message.channel.send(embeds.errorOccured(message, err));
        }
    }
    has (command) {
        return this.commands.has(command);
    }
}

module.exports = CommandHandler;
