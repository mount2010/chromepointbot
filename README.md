# Chrome Point Bot

[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/mount2010/chromepointbot.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mount2010/chromepointbot/context:javascript)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/mount2010/chromepointbot.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mount2010/chromepointbot/alerts/)


This is the source code for the bot used on @LifeOfChrome's Discord giveaway server.
Features include point tracking and modification features, and an automated puzzle answer system (WIP).

## Set up

Although this bot is meant for a specific server, you can also set it up for use on your own servers.
To set this bot up:

### 1. Clone the repository

Download [Git](https://help.github.com/articles/set-up-git/).
You will also need [MySQL](https://dev.mysql.com/downloads/mysql/) installed on your server or computer.
Then, clone the repository:

```bash
git clone https://github.com/mount2010/chromepointbot
```

This will download the repository to your computer.

### 2. Set up secrets.json

Open your favourite text editor, and create a file called secrets.json.
This is the structure of the file:

```json
    {
        "db": {
            "username": "",
            "password": ""
        },
        "token": ""
    }
```

Simply fill it in with your details. You can get a token at Discord's Developer portal. Click Add Application.

### 3. Install packages

```bash
    npm install
```

This will automatically download and install the dependencies (Discord.js, MySQL) to your computer.

### 4. Set up MySQL:

Log into MySQL and create a database (fill secrets.json with the DB name) and a table "user": 
```sql
    CREATE TABLE user (userid VARCHAR(255), points INT, history TEXT, credits INT);
```

### 5. Configure the bot

You can configure the bot in config.json and the JS files.
Please do tell me (Mount2010#9649) if you use my bot! This is optional, but I'd like to know!

### 6. Start the bot

```bash
    npm start
```
