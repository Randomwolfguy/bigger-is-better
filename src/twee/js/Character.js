function genChar(statPoints, speciesId, sizeRange, bodyTypeRange, genderId, name, pronounKey) {
    let character = { name: "", stats: {}, exp: {}, measurements: {}, gender: genders[genderId], capacity: {} };
    logger(`In char`)
    let size = sizes[randomSize(sizeRange)]
    logger(`After size`)
    let sizeKey = Object.keys(size)[0]

    let bodyType = bodyTypes[randomBodyType(bodyTypeRange)]
    logger(`After body`)
    let bodyTypeKey = Object.keys(bodyType)[0]

    let statMods = bodyType[bodyTypeKey].statMods
    let expMods = bodyType[bodyTypeKey].expMods

    // Collect All Potential Loot
    let rawLoot = [...bodyType[bodyTypeKey].loot, ...size[sizeKey].loot, ...character.gender[Object.keys(character.gender)[0]].loot]
    // Loop through and count items
    let availableLoot = []
    for (let item of rawLoot) {
        let found = false
        availableLoot.forEach(function (foundLoot, idx) {
            if (loot[item].id === foundLoot.id) {
                found = true
                availableLoot[idx].qty += 1
            }
        })
        if (!found)
            availableLoot.push({ id: loot[item].id, qty: 1, chnc: loot[item].chnc })
    }
    // Roll for credits
    var randomPercent = Math.clamp(random(1, 100), 75, 100) / 100
    var credits = Math.floor(50 * randomPercent);

    // Calculate Measurements
    logger(`Before height`)
    character.measurements.height = random(size[sizeKey].range[0], (size[sizeKey].range[1])?size[sizeKey].range[1]:1000000)
    character.measurements.bodyFat = bodyType[bodyTypeKey].bodyFat //HACK Rudimentary, need to change to ranges
    logger(`After height`)
    // Default Hyper to no
    let hyper = false

    // Species
    character.species = species[speciesId]

    // Calculate Stats
    statPoints = size[sizeKey].statBase
    calcStats(character, statMods, statPoints)

    // Base Attacks
    character.attacks = [0,1]
    character.learnedAttacks = character.attacks

    // Calculate Exp and Name (This was not fun)
    if (!name) {
        character.name = `${sizeKey} ${bodyTypeKey} ${species[speciesId]}`

        for (let exp in expMods)
            character.exp[exp] = getExpCalc(character, exp, expMods[exp], statPoints)

        character.loot = availableLoot
        character.credits = credits
    } else {
        character.name = name
        character.exp = blankExp()
        character.credits = 0
        character.skills = []
        character.skillPoints = 0
        character.inv = []
    }

    // Calculate Genitals... Oh boy
    character.gender = calcGenitals(hyper, character.measurements.height, character.gender, pronounKey)

    // Calculate Max Health and Current Health
    calcMaxHealth(character)

    // Calculate Capacity
    calcCapacity(character)

    return character;
}

function randomSize(range) {
    if (Array.isArray(range))
        return random(Math.clamp(range[0], 0, sizes.length - 1), Math.clamp(range[1], 0, sizes.length - 1))
    return Math.clamp(range, 0, sizes.length - 1)
}

function randomBodyType(range) {
    if (Array.isArray(range))
        return random(Math.clamp(range[0], 0, bodyTypes.length - 1), Math.clamp(range[1], 0, bodyTypes.length - 1))
    return Math.clamp(range, 0, bodyTypes.length - 1)
}

function calcStats(character, statMods, statPoints) {
    for (let statMod in statMods) {
        character.stats[statMod] = Math.ceil(statPoints * statMods[statMod])
    }
}

function calcGenitals(hyper, height, gender, pronounKey) {
    let hyperMod = hyper ? 2 : 1
    let genderKey = Object.keys(gender)[0]
    let response = {
        penis: Math.floor(((height / random(height - 20, height + 20)) + 1) * hyperMod) / 100,
        balls: Math.floor(((height / random(height - 5, height + 20)) + 1) * hyperMod) / 100,
        breasts: Math.floor(((height / random(100, height + 20)) + 1) * hyperMod) / 100,
        vagina: true
    }
    for (let gen in gender[genderKey]) {
        if (!gender[genderKey][gen])
            response[gen] = false
    }
    response.type = gender[genderKey].type
    response.pronouns = (pronounKey) ? pronounKey : gender[genderKey].pronouns
    return response
}

function blankExp() {
    return { muscle: 0, fat: 0, pawEye: 0, agility: 0, size: 0, skill: 0 }
}

function getExpCalc(character, exp, expMod, statPoints) {
    switch (exp) {
        case 'muscle':
            return Math.round(Math.log10(character.stats.strg)) * expMod
        case 'fat':
            return Math.round(Math.log10(character.stats.con)) * expMod
        case 'size':
            return Math.floor(Math.log(character.measurements.height) ** 2)
        case 'skill':
            return Math.floor(Math.log2(statPoints))
        case 'pawEye':
            return Math.round(Math.log10(character.stats.acc)) * expMod
        case 'agility':
            return Math.round(Math.log10(character.stats.dex)) * expMod
    }
}

function calcMaxHealth(character) {
    character.stats.hlth = getMaxHealth(character)
    character.stats.maxHlth = getMaxHealth(character)
}

//HACK Changed to BodyFat % temporarily to see how it effects health
function getMaxHealth(character) {
    let hB = Math.ceil(character.measurements.height * character.measurements.bodyFat)
    let con = character.stats.con
    return Math.ceil((con*Math.log(hB))+5)
}

//HACK need to finalize stomach capacity calcs
function calcCapacity(character) {
    character.capacity.stomachMax = Math.ceil(character.measurements.height / character.measurements.bodyFat)
    character.capacity.stomach = 0
    if (character.gender.balls) {
        let ballSize = character.measurements.height * character.gender.balls
        character.capacity.testiMax = Math.floor((4 / 3) * Math.PI * (ballSize ** 3)) * 2
        character.capacity.testi = 0
    }
}

window.sizeArray = function (range) {
    let sizeArr = []
    sizes.forEach(function (size, idx) {
        if (!range || range.includes(idx))
            sizeArr.push(Object.keys(size)[0])
    })
    return sizeArr
}

function statPoints(player) {
    return (player.stats.strg + player.stats.con + player.stats.dex + player.stats.acc) / 4
}