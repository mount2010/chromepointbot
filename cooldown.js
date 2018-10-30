class CooldownHandler {
    constructor () {
        this.userCooldownTimes = new Map();
        this.commandCooldownCache = new Map();
    }
    register (command, cooldown) {
        this.commandCooldownCache.set(command, cooldown);
    }
    insertCooldown (user, command) {
        if (this.commandCooldownCache.has(command)) {
            const now = new Date().valueOf();
            const timeToNextUse = now + (this.commandCooldownCache.get(command) * 1000);
            this.userCooldownTimes.set(user.id, timeToNextUse);
        }
        else {
            return false;
        }
    }
    checkTimeLeft (user) {
        if (!this.userCooldownTimes.has(user.id)) {
            return 0;
        }
        const now = new Date().valueOf();
        const timeToNextUse = this.userCooldownTimes.get(user.id);
        if (now >= timeToNextUse) {
            return 0;
        }
        else {
            return timeToNextUse - now;
        }

    }
    checkCooldown (user) {
        if (!this.userCooldownTimes.has(user.id)) {
            return true;
        }
        const now = new Date().valueOf();
        const timeToNextUse = this.userCooldownTimes.get(user.id);
        if (now >= timeToNextUse) {
            this.userCooldownTimes.delete(user.id);
            return true;
        }
        else {
            return false;
        }
    }
}

module.exports = CooldownHandler;