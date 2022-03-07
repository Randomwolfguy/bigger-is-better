import { skills } from '@js/data'
import { logger } from '@util/Logging';
import { popup } from '@controller/util/ModalPopup'

export function skillPassage() {
    let $wrapper = $('<span/>');

    $wrapper.append($('<span/>').wiki(`''__Learned Skills__''`).append($('<i/>').addClass('fa fa-camera-retro')))
    let player = State.variables.player
    let $list = $('<ul/>').addClass('no-bullets')
    $.each(player.skills, function (rowIndex, skillId) {
        let skill = skills[skillId]
        $list.append($('<li/>').wiki(`''${skill.name}'' - ${skill.desc}`))
    })
    $wrapper.append($list).append('<br>')
    $wrapper.append($('<span/>').wiki(`''__Available Skills''`))
    let $table = $('<table/>').addClass('skillTable');
    let tableData = [['Skill', 'Description', 'Points']];
    skills.forEach(function (skill, idx) {
        if (!State.variables.player.skills.includes(idx))
            tableData.push([skill.name, skill.desc, skill.cost, idx])
    })

    $.each(tableData, function (rowIndex, r) {
        var $row = $('<tr/>').attr('id', `skill-${r[3]}`)
        if (rowIndex > 0) {
            $row.append($(`<td/>`).wiki(r[0]))
            $row.append($(`<td/>`).wiki(r[1]))
            var $button = $(document.createElement('button')).wiki(r[2]).addClass('inactiveButton')
            if (player.skillPoints >= r[2]) {
                $button.ariaClick(function (ev) {
                    let notificationText = ''
                    if (State.variables.player.skillPoints >= r[2]) {
                        State.variables.player.skills.push(r[3])
                        State.variables.player.skillPoints -= r[2]

                        $(`#skill-${r[3]}`).remove()
                        $('<li/>').wiki(`''${r[0]}'' - ${r[1]}`).hide().appendTo(`ul.no-bullets`).fadeIn(1000).fadeOut(1000).fadeIn(1000)
                    } else
                        notificationText = `You don't have enough Skill Points!`

                    $('#notificationText').text(notificationText).show().delay(3000).fadeOut('slow')
                }).attr('title', 'Test').removeClass('inactiveButton')
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