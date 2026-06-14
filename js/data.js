var APP = APP || {};

APP.FLAGS = {
  'Mexico': '🇲🇽', 'Japan': '🇯🇵', 'Iran': '🇮🇷', 'Croatia': '🇭🇷',
  'Germany': '🇩🇪', 'Netherlands': '🇳🇱', 'Spain': '🇪🇸', 'Portugal': '🇵🇹',
  'Ecuador': '🇪🇨', 'Morocco': '🇲🇦', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Brazil': '🇧🇷',
  'Australia': '🇦🇺', 'Senegal': '🇸🇳', 'Austria': '🇦🇹', 'Argentina': '🇦🇷',
  'South Korea': '🇰🇷', 'Turkey': '🇹🇷', 'USA': '🇺🇸', 'Belgium': '🇧🇪',
  'France': '🇫🇷', 'Switzerland': '🇨🇭', 'Colombia': '🇨🇴', 'Uruguay': '🇺🇾',
  'Cape Verde': '🇨🇻', 'Paraguay': '🇵🇾', 'Ivory Coast': '🇨🇮', 'Curaçao': '🇨🇼',
  'South Africa': '🇿🇦', 'Bosnia': '🇧🇦', 'New Zealand': '🇳🇿', 'Qatar': '🇶🇦',
  'Haiti': '🇭🇹', 'Uzbekistan': '🇺🇿', 'Saudi Arabia': '🇸🇦', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Egypt': '🇪🇬', 'Norway': '🇳🇴', 'Canada': '🇨🇦', 'Algeria': '🇩🇿',
  'Iraq': '🇮🇶', 'Ghana': '🇬🇭', 'Sweden': '🇸🇪', 'Jordan': '🇯🇴',
  'DR Congo': '🇨🇩', 'Panama': '🇵🇦', 'Czech Republic': '🇨🇿', 'Tunisia': '🇹🇳',
  'Poland': '🇵🇱', 'Serbia': '🇷🇸', 'Romania': '🇷🇴',
  'Ukraine': '🇺🇦', 'Greece': '🇬🇷'
};

var ROUND_WEIGHT = { GROUP: 0, R32: 1, R16: 2, QF: 3, SF: 4, FINAL: 5 };

APP.flag = function(team) {
  return APP.FLAGS[team] || '🏳️';
};

APP.teamWeight = function(status) {
  if (!status) return -1;
  var w = ROUND_WEIGHT[status.round] !== undefined ? ROUND_WEIGHT[status.round] : 0;
  if (status.champion) return w + 1;
  return w;
};

APP.roundLabel = function(status) {
  if (!status) return 'Unknown';
  if (status.champion) return 'Champion';
  var labels = { GROUP: 'Group Stage', R32: 'R32', R16: 'R16', QF: 'QF', SF: 'SF', FINAL: 'Runner-up' };
  return labels[status.round] || status.round;
};

APP.badgeClass = function(status) {
  if (!status || status.eliminated) return 'badge-out';
  var w = APP.teamWeight(status);
  if (w >= 3) return 'badge-deep'; // QF or better
  if (w >= 0) return 'badge-active';
  return 'badge-pending';
};

// Returns sorted participant list for a track (topTeam or bottomTeam)
APP.sweepRank = function(participants, teamStatus, teamKey) {
  return participants.slice().sort(function(a, b) {
    var sa = teamStatus[a[teamKey]];
    var sb = teamStatus[b[teamKey]];
    var wa = APP.teamWeight(sa);
    var wb = APP.teamWeight(sb);
    if (wa !== wb) return wb - wa;
    var aElim = !sa || sa.eliminated;
    var bElim = !sb || sb.eliminated;
    if (aElim !== bElim) return aElim ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
};

APP.participantForTeam = function(participants, teamName) {
  return participants.find(function(p) {
    return p.topTeam === teamName || p.bottomTeam === teamName;
  });
};

APP.topParticipantForTeam = function(participants, teamName) {
  return participants.find(function(p) { return p.topTeam === teamName; });
};

APP.bottomParticipantForTeam = function(participants, teamName) {
  return participants.find(function(p) { return p.bottomTeam === teamName; });
};

APP.formatDate = function(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

APP.load = function() {
  return Promise.all([
    fetch('data/participants.json').then(function(r) { return r.json(); }),
    fetch('data/wc2026.json').then(function(r) { return r.json(); })
  ]).then(function(results) {
    APP.participants = results[0];
    APP.wc = results[1];
    return APP;
  });
};
