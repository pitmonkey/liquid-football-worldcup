var APP = APP || {};

APP.renderParticipants = function() {
  var el = document.getElementById('tab-participants');
  var participants = APP.participants;
  var teamStatus = APP.wc.teamStatus || {};

  // Sort: active (by deepest round) first, then eliminated alphabetically
  var sorted = APP.sweepRank(participants, teamStatus, 'topTeam');

  function statusCell(teamName) {
    var status = teamStatus[teamName];
    var eliminated = !status || status.eliminated;
    var label = APP.roundLabel(status);
    var badgeClass = APP.badgeClass(status);
    var nameClass = eliminated ? ' out' : '';
    return '<td><div class="team-cell">'
      + '<span class="team-flag">' + APP.flag(teamName) + '</span>'
      + '<span class="p-team-name' + nameClass + '">' + teamName + '</span>'
      + '</div></td>'
      + '<td><span class="lb-badge ' + badgeClass + '">' + label + '</span></td>';
  }

  var rows = sorted.map(function(p) {
    var topStatus    = teamStatus[p.topTeam];
    var bottomStatus = teamStatus[p.bottomTeam];
    var bothOut = (!topStatus || topStatus.eliminated) && (!bottomStatus || bottomStatus.eliminated);
    return '<tr class="' + (bothOut ? 'p-eliminated' : '') + '">'
      + '<td class="p-num">' + p.id + '</td>'
      + '<td class="p-name">' + p.name + '</td>'
      + statusCell(p.topTeam)
      + statusCell(p.bottomTeam)
      + '</tr>';
  }).join('');

  el.innerHTML = '<table class="participants-table">'
    + '<thead><tr>'
    + '<th>#</th>'
    + '<th>Name</th>'
    + '<th>🏆 Top Team</th>'
    + '<th>Status</th>'
    + '<th class="hide-mobile">🥔 Bottom Team</th>'
    + '<th class="hide-mobile">Status</th>'
    + '</tr></thead>'
    + '<tbody>' + rows + '</tbody>'
    + '</table>';
};
