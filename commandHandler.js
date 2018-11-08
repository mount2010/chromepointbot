const fs = require('fs');
const CooldownManager = require(`${process.cwd()}/cooldown.js`);

class CommandHandler {
    constructor () {
        this.commands = new Map();
        this.cooldownManager = new CooldownManager();
    }
    registerCommand (commandFileLink) {
        const command = require(`${process.cwd()}/${commandFileLink}`);
        if (command.info === undefined) {console.log(`${commandFileLink} has no info value, will skip`); return;}
        if (command.info.name === undefined) {console.log(`${commandFileLink} has no name, will skip`)}
        if (Array.isArray(command.info.name)) {
            for (let i = 0; i < command.info.name.length; i++) {
                if (!this.commands.has(command.info.name[i])) {
                    this.commands.set(command.info.name[i], command);
                    this.cooldownManager.register(command.info.name[i], command.info.cooldown);
                }
                else {console.log(`Duplicate alias/name for ${commandFileLink} "${command.info.name[i]}" `)}
            }
        }
        else {
            this.cooldownManager.register(command.info.name, command.info.cooldown);
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
    async go (what, client, message, args) {
        const cooldown = this.cooldownManager.checkCooldown(message.author);
        if (cooldown) {
            this.commands.get(what).run(client, message, args);
            this.cooldownManager.insertCooldown(message.author, what);
        }
        else {
            const cooldownLeft = this.cooldownManager.checkTimeLeft(message.author);
            const msg = await message.channel.send(embeds.cooldown(message, cooldownLeft, what));
            client.setTimeout(()=>{msg.delete()}, cooldownLeft);
        }
    }
    run (what, client, message, args) {
        try {
            if (this.commands.has(what)) {
                //check for permissions
                if (this.commands.get(what).permission) {
                    if (this.commands.get(what).permission(message)) {
                        this.go(what, client, message, args);
                    }
                    else {
                        message.channel.send(embeds.noPermissionEmbed(message, what, this.commands.get(what).restriction));
                    }
                }
                else {
                    this.go(what, client, message, args);
                }
            }
            else {
                message.channel.send(embeds.commandDoesntExistError(message, what));
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
