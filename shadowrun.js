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

    if (pool == 0){
        return results;
    }

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
        var results = "DicePool: " + value + "<br/>Hits: " + dicePool.hits + "<br/>Misses: " + dicePool.misses;
        if (dicePool.glitch != ''){
            results += "<br/><b>" + dicePool.glitch + "</b>";
        }
        document.getElementById("rollSingleDicePoolResults").innerHTML = results;
    }
}

function RollCombatBtn(){
    document.getElementById("rollCombatResults").innerHTML = '';

    var at_dp = document.getElementById("attackerDicePoolValue").value;
    var at_dm = document.getElementById("attackerDamageValue").value;
    var de_dp = document.getElementById("defenderDicePoolValue").value;
    var de_so = document.getElementById("defenderSoakValue").value;

    if (at_dp == '') {
        at_dp = 0;
    }
    if (at_dm == '') {
        at_dm = 0;
    }
    if (de_dp == '') {
        de_dp = 0;
    }
    if (de_so == '') {
        de_so = 0;
    }

    if (isNaN(at_dp) || isNaN(at_dm) || isNaN(de_dp) || isNaN(de_so)) {
        document.getElementById("rollCombatResults").innerHTML = 'Missing a numeric value.';
    }
    else {
        var p_at_dp = RollDicePool(at_dp);
        var p_de_dp = RollDicePool(de_dp);
        var p_de_so = RollDicePool(de_so);

        var results = '';

        results +=
            "AttackerDicePool: " + at_dp +
            "<br/>Hits: " + p_at_dp.hits +
            "<br/>Misses: " + p_at_dp.misses;
        if (p_at_dp.glitch != ''){
            results += "<br/><b>Attacker: " + p_at_dp.glitch + "</b>";
        }
        results +=
            "<br/>DefenderDicePool: " + de_dp +
            "<br/>Hits: " + p_de_dp.hits +
            "<br/>Misses: " + p_de_dp.misses;
        if (p_de_dp.glitch != ''){
            results += "<br/><b>Defender: " + p_de_dp.glitch + "</b>";
        }

        if (p_de_dp.hits >= p_at_dp.hits) {
            results += "<br/><br/><b>Miss.</b>";
        }
        else {
            var netHits = p_at_dp.hits - p_de_dp.hits
            var netDmg = Number(at_dm) + Number(netHits);
            results += "<br/><br/><b>Hit. " + netHits +
                " net hits</b> added to damage.<br/>Rolling soak vs " + netDmg;
            results +=
                "<br/>DefenderSoakPool: " + de_so +
                "<br/>Hits: " + p_de_so.hits +
                "<br/>Misses: " + p_de_so.misses;
            if (p_de_so.glitch != '') {
                results += "<br/><b>Defender: " + p_de_so.glitch + "</b>";
            }
            if (p_de_so.hits > netDmg) {
                results += "<br/>No damage.";
            }
            else {
                var dmg = Number(netDmg) - Number(p_de_so.hits);
                results += "<br>" + dmg + " damage.";
            }
        }

        document.getElementById("rollCombatResults").innerHTML = results;
    }
}

