/* Character object architecture

{
    "attributes":{
        "body": 0,
        "agility": 0,
        "reaction": 0,
        "strength": 0,
        "willpower": 0,
        "logic": 0,
        "intuition": 0,
        "charisma": 0,
        "edge": 0,
        "essence": 0.0,
        "magic": null,
        "resonance": null
    },
    "skills":{
        ""
    }
}

*/

function RollD6(){
    return Math.floor(Math.random() * ((6 - 1) + 1) + 1);
}

function RollDicePool(pool){
    var results = {};
    results.resultRolls = [];
    results.misses = 0;
    results.hits = 0;
    results.sixes = 0;

    var singleRoll;
    for (var i = 0; i < pool; i++) {
        singleRoll = RollD6();
        results.resultRolls[i] = singleRoll;
        if (singleRoll == 1){
            results.misses += 1;
        }
        else if (singleRoll >= 5){
            results.hits += 1;
            if (singleRoll == 6) {
                results.sixes += 1;
            }
        }

    }
    return results;
}

function RollSingleDicePoolBtn(){
    document.getElementById("rollSingleDicePoolResults").innerHTML = '';
    var value = document.getElementById("rollSingleDicePoolValue").value;
    if (!isNaN(value)){
        var dicePool = RollDicePool(value);
        var results = "DicePool: " + value + "<br/>Hits: " + dicePool.hits + "<br/>Misses: " + dicePool.misses;
        document.getElementById("rollSingleDicePoolResults").innerHTML = results;
    }
    else {
        document.getElementById("rollSingleDicePoolResults").innerHTML = 'Not a numeric value.';   
    }
}

