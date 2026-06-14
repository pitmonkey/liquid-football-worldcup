var APP = APP || {};

APP.renderGroups = function(filterGroup) {
  var el = document.getElementById('tab-groups');
  var participants = APP.participants;
  var groups = APP.wc.groups || {};
  var groupKeys = Object.keys(groups).sort();

  if (groupKeys.length === 0) {
    el.innerHTML = '<div class="empty-state">No group data yet — check back soon.</div>';
    return;
  }

  // Build set of group letters that contain sweep teams
  var sweepGroups = {};
  groupKeys.forEach(function(g) {
    var standings = (groups[g].standings || []);
    standings.forEach(function(row) {
      if (APP.topParticipantForTeam(participants, row.team) ||
          APP.bottomParticipantForTeam(participants, row.team)) {
        sweepGroups[g] = true;
      }
    });
  });

  // Filter pills
  var pills = '<div class="group-pills">'
    + '<button class="group-pill' + (!filterGroup ? ' active' : '') + '" onclick="APP.renderGroups(null)">All</button>';
  groupKeys.forEach(function(g) {
    var hasSweep = sweepGroups[g] ? ' has-sweep' : '';
    var isActive = filterGroup === g ? ' active' : '';
    pills += '<button class="group-pill' + hasSweep + isActive + '" onclick="APP.renderGroups(\'' + g + '\')">' + g + '</button>';
  });
  pills += '</div>';

  var visibleGroups = filterGroup ? [filterGroup] : groupKeys;

  var cards = '<div class="groups-grid">';
  visibleGroups.forEach(function(g) {
    var data = groups[g];
    if (!data) return;
    var standings = data.standings || [];
    var matches   = data.matches   || [];

    // Standings rows
    var standingRows = standings.map(function(row, idx) {
      var topP    = APP.topParticipantForTeam(participants, row.team);
      var bottomP = APP.bottomParticipantForTeam(participants, row.team);
      var label   = '';
      if (topP)    label += '<span class="participant-label top">'    + topP.name    + '</span>';
      if (bottomP) label += '<span class="participant-label bottom">' + bottomP.name + ' ★</span>';
      var qualified = idx < 2 ? ' qualified' : '';  // top 2 shown as qualified; full logic from API
      return '<tr class="' + qualified + '">'
        + '<td class="left" style="padding-left:12px"><div class="team-cell">'
        + '<span class="team-flag">' + APP.flag(row.team) + '</span>'
        + '<div class="team-info"><span class="team-name">' + row.team + '</span>' + label + '</div>'
        + '</div></td>'
        + '<td>' + row.played + '</td>'
        + '<td>' + row.won   + '</td>'
        + '<td>' + row.drawn + '</td>'
        + '<td>' + row.lost  + '</td>'
        + '<td>' + (row.gd >= 0 ? '+' : '') + row.gd + '</td>'
        + '<td class="pts">' + row.points + '</td>'
        + '</tr>';
    }).join('');

    // Match rows
    var matchRows = matches.map(function(m) {
      var finished = m.status === 'FINISHED';
      var rowClass = finished ? '' : ' upcoming';
      var scoreHtml = finished
        ? '<span class="score-box">' + m.homeScore + '–' + m.awayScore + '</span>'
        : '<span class="score-box upcoming">vs</span>';
      var dateHtml = '<span class="match-date' + (finished ? ' played' : '') + '">' + APP.formatDate(m.date) + '</span>';
      return '<div class="result-row' + rowClass + '">'
        + '<span class="result-home">' + APP.flag(m.home) + ' ' + m.home + '</span>'
        + scoreHtml
        + '<span class="result-away">' + APP.flag(m.away) + ' ' + m.away + '</span>'
        + dateHtml
        + '</div>';
    }).join('');

    cards += '<div class="group-card">'
      + '<div class="group-card-title">Group ' + g + '</div>'
      + '<table class="standings-table">'
      + '<thead><tr>'
      + '<th class="left" style="padding-left:12px">Team</th>'
      + '<th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>'
      + '</tr></thead>'
      + '<tbody>' + standingRows + '</tbody>'
      + '</table>'
      + '<div class="results-divider">Results &amp; Fixtures</div>'
      + matchRows
      + '</div>';
  });
  cards += '</div>';

  el.innerHTML = pills + cards;
};
