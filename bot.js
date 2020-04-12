var Discord = require('discord.js');
var auth = require('./auth.json');
const sr = require('./shadowrun.js');

//key is command, value is command it translates to
//used for multi commands
const commands = {
    "dp": "dp",
    "r": "dp",
    "roll": "dp",
    "dicepool": "dp",
}

//initialize discord bot
var bot = new Discord.Client();
bot.once('ready', () => {
    console.log('Ready!');
});
bot.login(auth.token);

bot.on('message', message => {
    var msg = message.content;
    if (msg.substring(0, 1) == '!') {
        //grab the whole message and split it into args by spaces
        var args = msg.substring(1).split(' ');
        //the command is the first arg
        var cmd = args[0].toLowerCase();
        //so remove it from the args
        args = args.splice(1);
        //and execute based on which command
        switch(commands[cmd]) {
            case 'dp':
                var response = /*"```" + */message.author.username + " rolled: \n------\n";
                response += RollDicePool(args[0]);
                /*response += "```";*/
                message.channel.send(response);
            break;
         }
     }
});

function RollDicePool(pool) {
    var results = sr.RollDicePool(pool);
    var msg = "**DicePool:** " + results.dicePool;
    msg += "\n**Hits:** " + results.hits;
    msg += "\n**Misses:** " + results.misses;
     if (results.glitch != ''){
        msg += "\n***--" + results.glitch + "--***";
    }
    return msg;
}