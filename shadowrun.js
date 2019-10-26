function RollD6(){
    return Math.floor(Math.random() * ((6 - 1) + 1) + 1);
}

function RollDicePool(pool){
    var results = {};
    results.resultRolls = [];
    results.misses = 0;
    results.hits = 0;
    results.sixes = 0;
    results.glitch = '';

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
    if (results.misses >= pool/2){
        if (results.hits == 0){
            results.glitch += 'Critical ';       
        }
        results.glitch += 'Glitch!'
    }
    return results;
}



function RollSingleDicePoolBtn(){
    document.getElementById("rollSingleDicePoolResults").innerHTML = '';
    var value = document.getElementById("rollSingleDicePoolValue").value;
    if (isNaN(value) || value == ''){
        document.getElementById("rollSingleDicePoolResults").innerHTML = 'Not a numeric value.';   
    }
    else {
        var dicePool = RollDicePool(value);
        console.log(dicePool);
        var results = "DicePool: " + value + "<br/>Hits: " + dicePool.hits + "<br/>Misses: " + dicePool.misses;
        if (dicePool.glitch != ''){
            results += "<br/><b>" + dicePool.glitch + "</b>";
        }
        document.getElementById("rollSingleDicePoolResults").innerHTML = results;
    }
}

