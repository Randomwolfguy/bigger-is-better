import { returnStatName } from "@controller/character/CharacterController";
import { findSize } from "@controller/character/MeasurementController";
import { attacks } from "@js/data";

export function attacksPassage() {
    let $wrapper = $('<span/>');
    $wrapper.append($('<span/>').wiki(`''__Learned Attacks__''`))
    let player = variables().player
    let $list = $('<ul/>').addClass('no-bullets')
    $.each(player.learnedAttacks, function (rowIndex, attackId) {
        let attack = attacks.attacks[attackId]
        $list.append($('<li/>').wiki(`''${attack.name}'' - ${attack.desc}`))
    })
    $wrapper.append($list).append('<br>')

    $wrapper.append($('<span/>').wiki(`''__Available Attacks__''`))
    let $table = $('<table/>').addClass('skillTable').addClass('skillTable');
    let tableData = [['Attack', 'Description', 'Requirements', 'Points']];
    
    attacks.attacks.forEach(function (attack, idx) {
        if (!variables().player.learnedAttacks.includes(idx))
            tableData.push([attack.name, attack.desc, attack.cost, idx, attack.reqs])
    })

    $.each(tableData, function (rowIndex, r) {
        var $row = $('<tr/>').attr('id', `attack-${r[3]}`)
        if (rowIndex > 0) {
            $row.append($(`<td/>`).wiki(r[0]))
            $row.append($(`<td/>`).wiki(r[1]))
            let reqText = ``
            $.each(r[4], function (reqName, reqValue) {
                if (reqText !== ``)
                    reqText += `<br>`
                reqText += `${returnStatName(reqName)}: ${reqName==='height'?findSize(reqValue):reqValue}`
            })
            $row.append($(`<td/>`).wiki(reqText !== ``?reqText:`None`))

            var $button = $(document.createElement('button')).wiki(r[2]).addClass('inactiveButton')
            if (player.skillPoints >= r[2] && checkStatReqs(r[4], player)) { // Enough Skill Points and reqs
                $button.ariaClick(function (ev) {
                    let notificationText = ''
                    if (State.variables.player.skillPoints >= r[2]) {
                        State.variables.player.learnedAttacks.push(r[3])
                        State.variables.player.skillPoints -= r[2]

                        $(`#attack-${r[3]}`).remove()
                        $('<li/>').wiki(`''${r[0]}'' - ${r[1]}`).hide().appendTo(`ul.no-bullets`).fadeIn(1000).fadeOut(1000).fadeIn(1000)
                    } else
                        notificationText = `You don't have enough Skill Points!`

                    $('#notificationText').text(notificationText).show().delay(3000).fadeOut('slow')
                }).removeClass('inactiveButton')
            }


            $row.append($(`<td/>`).addClass('fullSizeTableButton').append($button))
        } else {
            $.each(r, function (colIndex, c) {
                $row.append($(`<th/>`).wiki(c))
            })
        }
        $table.append($row)
    });

    $wrapper
        .append($('<p/>').attr('id', 'notificationText').css('color', 'red').hide())
        .append($table)

    return $wrapper
}

function checkStatReqs(reqs, player) {
    for(let req in reqs) 
        if(reqs[req]>findJSONValueByKey(player,req))
            return false
    
    return true
}

function findJSONValueByKey(json, key) {
    let temp;
    for(let k in json) {
        if(typeof(json[k]) === "object" && !Array.isArray(json[k]))
            temp = findJSONValueByKey(json[k], key)
        
        if(typeof temp !== 'undefined')
            return temp

        if(k === key) 
            return json[k]
    }
}