var Discord = require('discord.js');
// required auth file, uses the following structure:
//
//{
//     "token": "MyDiscordBotToken"
// }
//
//
var auth = require('./auth.json');
const sr = require('./shadowrun.js');

//possible commands
const possibleCommands = {
    "help": "help",
    "dicepool": "dicepool",
    "dice": "dice",
    "initiative": "initiative",
    "threshold": "threshold",
    "opposed": "opposed",
};
//key is command, value is command it translates to
//used for multi commands
const commands = {
    "dp": possibleCommands["dicepool"],
    "r": possibleCommands["dicepool"],
    "roll": possibleCommands["dicepool"],
    "dicepool": possibleCommands["dicepool"],
    "dice": possibleCommands["dice"],
    "die": possibleCommands["dice"],
    "d": possibleCommands["dice"],
    "init": possibleCommands["initiative"],
    "initiative": possibleCommands["initiative"],
    "i": possibleCommands["initiative"],
    "h": possibleCommands["help"],
    "help": possibleCommands["help"],
    "t": possibleCommands["threshold"],
    "threshold": possibleCommands["threshold"],
    "thresh": possibleCommands["threshold"],
    "o": possibleCommands["opposed"],
    "opp": possibleCommands["opposed"],
    "opposed": possibleCommands["opposed"],
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
        var response = "";
        switch(commands[cmd]) {
            case 'help':
                response = "```Welcome to the ShadowBot Bot.\n"
                    + "Current possible commands are: \n"
                    + "  *help (this)\n"
                    + "  *dice (!d [x]--optional) (rolls [x] dice (1 if not given) and adds them together)\n"
                    + "  *initiative (!i [x] [y]) (rolls [x] dice, and adds them together with [y])\n"
                    + "  *dicepool (!dp [x]) (rolls [x] dice and counts successes and glitches)\n"
                    + "  *threshold (!t [x] [y]) (rolls [x] dice pool and compares successes to [y] threshold)\n"
                    + "  *opposed (!o [x] [y]) (rolls [x] actor's dice pool and compares against [y] defender's dice pool)\n"
                    + "```";

                message.channel.send(response);
            break;
            case 'dice':
                var numDice = args[0];
                if (!VerifyNumber(numDice)) {
                    numDice = 1
                }

                response = message.author.username + " rolled " + numDice + "D6. Result: ";
                response += "**" + RollDice(numDice) + "**";
                message.channel.send(response);
            break;
            case 'dicepool':
                var numDice = args[0];

                if (VerifyNumber(numDice)) {
                    response = message.author.username + " rolled: \n------\n";
                    response += RollDicePool(numDice);
                }
                else {
                    response = RollerError(message.author.username, "Dice pool roll must provide number of dice.");
                }
                message.channel.send(response);
            break;
            case 'initiative':
                var numDice = args[0];
                var flatBonus = args[1];

                if (VerifyNumber(numDice) && VerifyNumber(flatBonus)) {
                    var totalInit = parseInt(RollDice(numDice)) + parseInt(flatBonus);
                    response = message.author.username + " rolled an initiative of " + numDice + "D6+" + flatBonus + " for an initiative score of: ";
                    response += "**" + totalInit + "**";
                }
                else {
                    response = RollerError(message.author.username, "Initiative roll must provide number of dice, and bonus.");
                }

                message.channel.send(response);
            break;
            case 'threshold':
                var numDice = args[0];
                var thresh = args[1];

                if (VerifyNumber(numDice) && VerifyNumber(thresh)) {
                    response = message.author.username + " rolled **" + numDice + " dice** against a threshold of " + thresh + ". ";
                    var dp = sr.RollDicePool(numDice);

                    if (dp.hits > thresh) {
                        response += "**Success** with " + dp.hits + " hits";
                        if (dp.glitch != '') {
                            response += ", but " + "***--" + dp.glitch + "--***"
                        }
                        response += "."
                    }
                    else {
                        response += dp.hits + " hits **failed to reach threshold.**"
                    }
                }
                else {
                    response = RollerError(message.author.username, "Threshold roll must provide number of dice, and target threshold.");
                }

                message.channel.send(response);
            break;
            case 'opposed':
                var actorDice = args[0];
                var defenderDice = args[1];

                if (VerifyNumber(actorDice) && VerifyNumber(defenderDice)) {
                    var actor = sr.RollDicePool(actorDice);
                    var defender = sr.RollDicePool(defenderDice);

                    response = message.author.username + " rolled an opposed test - " + actorDice + " dice vs " + defenderDice + " dice: \n------\n";
                    response += "**Actor**\n";
                    response += "*Hits:* " + actor.hits + "\n";
                    response += "*Misses* " + actor.misses + "\n";
                    if (actor.glitch != ''){
                        response += "***--" + actor.glitch + "--***\n";
                    }
                    response += "*-vs-*\n";
                    response += "**Defender**\n";
                    response += "*Hits:* " + defender.hits + "\n";
                    response += "*Misses* " + defender.misses + "\n";
                    if (defender.glitch != ''){
                        response += "***--" + defender.glitch + "--***\n";
                    }
                    response += "\nResult: ";

                    if (actor.hits > defender.hits) {
                        // defender wins ties
                        response += "**Actor** wins, with " + (actor.hits - defender.hits) + " net hits";
                        if (actor.glitch != ''){
                            response += ", but with a " + actor.glitch;
                        }
                        if (defender.glitch != ''){
                            response += ". In addition, the defender suffers a " + defender.glitch;
                        }
                    }
                    else {
                        response += "**Defender** wins, with " + (defender.hits - actor.hits) + " net hits";
                        if (defender.glitch != ''){
                            response += ", but with a " + defender.glitch;
                        }
                        if (actor.glitch != ''){
                            response += ". In addition, the actor suffers a " + actor.glitch;
                        }
                    }
                    response += "."
                }
                else {
                    response = RollerError(message.author.username, "Opposed dice pool roll must provide actor number of dice, and defender number of dice.");
                }
                message.channel.send(response);
            break;
         }
     }
});

function RollDice(numDice) {
    var result = 0;
    for (var i = 0; i < numDice; i++) {
        result += sr.RollD6();
    }
    return result;
}

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

function VerifyNumber(str) {
    var verify = parseInt(str);
    if (typeof str !== "undefined" && typeof verify === "number" && verify != "NaN") {
        return true;
    }
    return false;
}

function RollerError(user, reason) {
    var msg = "Sorry **" + user + "**, I could not roll that. " + reason;
    return msg;
}