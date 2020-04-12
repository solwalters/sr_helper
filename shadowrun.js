function _RollD6(){
    return Math.floor(Math.random() * ((6 - 1) + 1) + 1);
}

function _RollDicePool(pool){
    var results = {};
    results.dicePool = pool;
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
        singleRoll = _RollD6();
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

function RollDicePool(pool){
    var dicePool = _RollDicePool(pool);
    return dicePool;
}

// --------- exports for Discord Bot
if (typeof exports === "object"){
    module.exports.RollDicePool = RollDicePool;
}

// ---------------------------------

function RollSingleDicePoolBtn(){
    document.getElementById("rollSingleDicePoolResults").innerHTML = '';
    var value = document.getElementById("rollSingleDicePoolValue").value;
    if (isNaN(value) || value == ''){
        document.getElementById("rollSingleDicePoolResults").innerHTML = 'Not a numeric value.';   
    }
    else {
        var results = RollDicePool(value);
        var print = "DicePool: " + value + "<br/>Hits: " + results.hits + "<br/>Misses: " + results.misses;
        if (results.glitch != ''){
            results += "<br/><b>" + results.glitch + "</b>";
        }
        document.getElementById("rollSingleDicePoolResults").innerHTML = print;
    }
}

function RollCombatBtn(){
    document.getElementById("rollCombatResults").innerHTML = '';

    var at_dp = document.getElementById("attackerDicePoolValue").value;
    var at_dm = document.getElementById("attackerDamageValue").value;
    var at_dt = null;
    if (document.querySelector('input[name="attackerDamageType"]:checked') != null) {
        at_dt = document.querySelector('input[name="attackerDamageType"]:checked').value;
    }
    var at_ap = document.getElementById("attackerArmorPenetration").value;
    var at_di = null;
    if (document.querySelector('input[name="attackerAPDirection"]:checked') != null) {
        at_di = document.querySelector('input[name="attackerAPDirection"]:checked').value;
    }

    var de_dp = document.getElementById("defenderDicePoolValue").value;
    var de_ar = document.getElementById("defenderArmorValue").value;
    var de_bo = document.getElementById("defenderBodyValue").value;

    if (at_dp == '') {
        at_dp = 0;
    }
    if (at_dm == '') {
        at_dm = 0;
    }
    if (at_ap == '') {
        at_ap = 0;
    }
    if (de_dp == '') {
        de_dp = 0;
    }
    if (de_ar == '') {
        de_ar = 0;
    }
    if (de_bo == '') {
        de_bo = 0;
    }

    if (isNaN(at_dp) || isNaN(at_dm) || isNaN(at_ap) ||
            isNaN(de_dp) || isNaN(de_ar) || isNaN(de_bo)) {
        document.getElementById("rollCombatResults").innerHTML = 'Missing a numeric value.';
    }
    else if (at_dt == null || at_di == null) {
        document.getElementById("rollCombatResults").innerHTML = 'Select damage type and AP +/-';
    }
    else {
        var results = '';
        
        var attackerDicePool = _RollDicePool(at_dp);
        results +=
            "Attacker Dice Pool: " + attackerDicePool.dicePool +
            "<br/>Hits: " + attackerDicePool.hits +
            "<br/>Misses: " + attackerDicePool.misses;
        if (attackerDicePool.glitch != ''){
            results += "<br/><b>Attacker: " + attackerDicePool.glitch + "</b>";
        }
        results += "<br/>";

        var defenderDicePool = _RollDicePool(de_dp);
        results +=
            "<br/>Defender Dice Pool: " + defenderDicePool.dicePool +
            "<br/>Hits: " + defenderDicePool.hits +
            "<br/>Misses: " + defenderDicePool.misses;
        if (defenderDicePool.glitch != ''){
            results += "<br/><b>Defender: " + defenderDicePool.glitch + "</b>";
        }
        results += "<br/>";

        if (attackerDicePool.hits == defenderDicePool.hits) {
            results += "<br/><b>Grazing hit.</b> No damage, \
                but contact (poison, shock, touch-only spells, etc) was made.";
        }
        else if (attackerDicePool.hits < defenderDicePool.hits) {
            results += "<br/><b>Miss.</b>";
        }
        else {
            var netHits = attackerDicePool.hits - defenderDicePool.hits;
            var netDmg = Number(at_dm) + Number(netHits);
            results += "<br/><b>Hit.</b> " + netHits +
                " net hits added to damage. Total damage is " + netDmg + "<br/>";

            var netArmor = 0;
            if (at_di == '+') {
                netArmor = Number(at_ap) + Number(de_ar);
            }
            else {
                netArmor = Number(de_ar) - Number(at_ap);
            }
            results += "<br/>Applying AP value of " + at_di + at_ap +
                ". Modified Armor Value is " + netArmor + ". ";

            var damageType = 'Stun';
            if (at_dt == 'P') {
                if (netDmg >= netArmor) {
                    damageType = "Physical";
                }
            }
            results += "Damage is " + damageType + ". ";

            if (netArmor < 0) {
                netArmor = 0;
                results += "Armor is penetrated or not present.";
            }
            var defenderSoakPool = _RollDicePool(Number(de_bo) + netArmor)

            results += "<br/>Rolling soak vs " + netDmg + " total damage.";
            results +=
                "<br/>Defender Soak Pool: " + defenderSoakPool.dicePool +
                "<br/>Hits: " + defenderSoakPool.hits +
                "<br/>Misses: " + defenderSoakPool.misses;
            if (defenderSoakPool.glitch != '') {
                results += "<br/><b>Defender: " + defenderSoakPool.glitch + "</b>";
            }
            if (defenderSoakPool.hits > netDmg) {
                results += "<br/><b>No damage.</b>";
            }
            else {
                var dmg = Number(netDmg) - Number(defenderSoakPool.hits);
                results += "<br><b>" + dmg + " " + damageType + " damage.</b>";
            }
        }

        document.getElementById("rollCombatResults").innerHTML = results;
    }
}

