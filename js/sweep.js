var APP = APP || {};

APP.renderSweep = function() {
  var el = document.getElementById('tab-sweep');
  var participants = APP.participants;
  var teamStatus = APP.wc.teamStatus || {};

  var winnerRanked   = APP.sweepRank(participants, teamStatus, 'topTeam');
  var lameRanked     = APP.sweepRank(participants, teamStatus, 'bottomTeam');

  function buildLeaderboard(ranked, teamKey, headerClass, icon, title, subtitle) {
    var rows = '';
    var displayRank = 1;
    ranked.forEach(function(p, i) {
      var status = teamStatus[p[teamKey]];
      var eliminated = !status || status.eliminated;
      var weight = APP.teamWeight(status);
      var prevWeight = i > 0 ? APP.teamWeight(teamStatus[ranked[i-1][teamKey]]) : null;
      var prevElim = i > 0 ? (!teamStatus[ranked[i-1][teamKey]] || teamStatus[ranked[i-1][teamKey]].eliminated) : null;
      if (i > 0 && (weight !== prevWeight || eliminated !== prevElim)) displayRank = i + 1;

      var rankClass = eliminated ? '' : (headerClass === 'gold' ? 'gold' : 'red');
      var label = APP.roundLabel(status);
      var badgeClass = APP.badgeClass(status);
      var flag = APP.flag(p[teamKey]);
      var teamDisplay = eliminated
        ? '<span class="lb-team" style="text-decoration:line-through;color:var(--dim)">' + flag + ' ' + p[teamKey] + '</span>'
        : '<span class="lb-team">' + flag + ' ' + p[teamKey] + '</span>';

      rows += '<div class="lb-row' + (eliminated ? ' eliminated' : '') + '">'
        + '<div class="lb-rank ' + rankClass + '">' + (eliminated ? '—' : displayRank) + '</div>'
        + '<div class="lb-name">' + p.name + '</div>'
        + teamDisplay
        + '<div class="lb-badge ' + badgeClass + '">' + label + '</div>'
        + '</div>';
    });

    return '<div class="leaderboard">'
      + '<div class="lb-header ' + headerClass + '">'
      + '<span class="lb-icon">' + icon + '</span>'
      + '<span class="lb-title">' + title + '</span>'
      + '<span class="lb-subtitle">' + subtitle + '</span>'
      + '</div>'
      + rows
      + '</div>';
  }

  function isOut(team) {
    var s = teamStatus[team];
    return !s || s.eliminated;
  }

  function buildGraveyard() {
    var dead = participants.filter(function(p) {
      return isOut(p.topTeam) && isOut(p.bottomTeam);
    });

    var inner;
    if (dead.length === 0) {
      inner = '<div class="grave-empty">Nobody dead yet. Give it time. 💀</div>';
    } else {
      inner = '<div class="grave-grid">' + dead.map(function(p) {
        return '<div class="grave-card">'
          + '<div class="grave-rip">R.I.P.</div>'
          + '<div class="grave-name">' + p.name + '</div>'
          + '<div class="grave-flags">' + APP.flag(p.topTeam) + APP.flag(p.bottomTeam) + '</div>'
          + '<div class="grave-cross">✝</div>'
          + '</div>';
      }).join('') + '</div>';
    }

    return '<div class="graveyard">'
      + '<div class="grave-header"><span class="grave-icon">⚰️</span> Graveyard '
      + '<span class="grave-subtitle">both teams out — fully eliminated</span></div>'
      + inner
      + '</div>';
  }

  var tournamentDay = Math.ceil((Date.now() - new Date('2026-06-11').getTime()) / 86400000);
  el.innerHTML = '<div class="section-header">Sweep Leaderboards — Day ' + tournamentDay + ' of 39</div>'
    + '<div class="sweep-grid">'
    + buildLeaderboard(winnerRanked, 'topTeam', 'gold', '🏆', 'Winner Race', 'Top 24 nations')
    + buildLeaderboard(lameRanked, 'bottomTeam', 'red', '🥔', 'Lame-Winner', 'who is even winning this??')
    + '</div>'
    + buildGraveyard();
};
