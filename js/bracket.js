var APP = APP || {};

APP.renderBracket = function(activeRound) {
  var el = document.getElementById('tab-bracket');
  var participants = APP.participants;
  var knockout = APP.wc.knockout || {};
  var rounds = ['R32', 'R16', 'QF', 'SF', 'FINAL'];
  var roundLabels = { R32: 'Round of 32', R16: 'Round of 16', QF: 'Quarter-Finals', SF: 'Semi-Finals', FINAL: 'Final' };

  // Default to the deepest round that has matches
  if (!activeRound) {
    activeRound = 'R32';
    rounds.forEach(function(r) {
      if ((knockout[r] || []).length > 0) activeRound = r;
    });
  }

  // Round tabs
  var tabs = '<div class="round-tabs">';
  rounds.forEach(function(r) {
    var cls = r === activeRound ? ' active' : '';
    tabs += '<button class="round-tab' + cls + '" onclick="APP.renderBracket(\'' + r + '\')">'
      + roundLabels[r] + '</button>';
  });
  tabs += '</div>';

  var matches = knockout[activeRound] || [];
  if (matches.length === 0) {
    el.innerHTML = tabs + '<div class="empty-state">No ' + roundLabels[activeRound] + ' fixtures yet.</div>';
    return;
  }

  var cards = '<div class="matches-grid">';
  matches.forEach(function(m, idx) {
    var finished = m.status === 'FINISHED';
    var homeWon = finished && m.homeScore > m.awayScore;
    var awayWon = finished && m.awayScore > m.homeScore;

    function sweepLabel(teamName) {
      var top    = APP.topParticipantForTeam(participants, teamName);
      var bottom = APP.bottomParticipantForTeam(participants, teamName);
      if (top)    return '<span class="participant-label top">' + top.name + '</span>';
      if (bottom) return '<span class="participant-label bottom">' + bottom.name + ' ★</span>';
      return '';
    }

    function teamRow(teamName, goals, won, upcoming) {
      var rowClass = upcoming ? ' upcoming' : (won ? ' winner' : '');
      var goalsClass = upcoming ? ' tbd' : (won ? '' : ' lose');
      var goalsStr = upcoming ? '–' : String(goals);
      return '<div class="match-team-row' + rowClass + '">'
        + '<div class="match-team-left">'
        + '<span>' + APP.flag(teamName) + '</span>'
        + '<span>' + teamName + '</span>'
        + sweepLabel(teamName)
        + '</div>'
        + '<div class="match-goals' + goalsClass + '">' + goalsStr + '</div>'
        + '</div>';
    }

    var upcoming = !finished;
    var card = '<div class="match-card">'
      + '<div class="match-card-label">Match ' + (idx + 1) + ' · ' + APP.formatDate(m.date) + '</div>'
      + teamRow(m.home, m.homeScore, homeWon, upcoming)
      + teamRow(m.away, m.awayScore, awayWon, upcoming);

    if (upcoming) {
      card += '<div class="match-card-meta">Upcoming</div>';
    }
    card += '</div>';
    cards += card;
  });
  cards += '</div>';

  el.innerHTML = tabs + cards;
};
