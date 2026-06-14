var APP = APP || {};

APP.FLAGS = {
  'Mexico': 'mx', 'Japan': 'jp', 'Iran': 'ir', 'Croatia': 'hr',
  'Germany': 'de', 'Netherlands': 'nl', 'Spain': 'es', 'Portugal': 'pt',
  'Ecuador': 'ec', 'Morocco': 'ma', 'England': 'gb-eng', 'Brazil': 'br',
  'Australia': 'au', 'Senegal': 'sn', 'Austria': 'at', 'Argentina': 'ar',
  'South Korea': 'kr', 'Turkey': 'tr', 'USA': 'us', 'Belgium': 'be',
  'France': 'fr', 'Switzerland': 'ch', 'Colombia': 'co', 'Uruguay': 'uy',
  'Cape Verde Islands': 'cv', 'Paraguay': 'py', 'Ivory Coast': 'ci', 'Curaçao': 'cw',
  'South Africa': 'za', 'Bosnia': 'ba', 'New Zealand': 'nz', 'Qatar': 'qa',
  'Haiti': 'ht', 'Uzbekistan': 'uz', 'Saudi Arabia': 'sa', 'Scotland': 'gb-sct',
  'Egypt': 'eg', 'Norway': 'no', 'Canada': 'ca', 'Algeria': 'dz',
  'Iraq': 'iq', 'Ghana': 'gh', 'Sweden': 'se', 'Jordan': 'jo',
  'DR Congo': 'cd', 'Panama': 'pa', 'Czech Republic': 'cz', 'Tunisia': 'tn',
  'Poland': 'pl', 'Serbia': 'rs', 'Romania': 'ro',
  'Ukraine': 'ua', 'Greece': 'gr'
};

var ROUND_WEIGHT = { GROUP: 0, R32: 1, R16: 2, QF: 3, SF: 4, FINAL: 5 };

APP.flag = function(team) {
  var code = APP.FLAGS[team];
  if (!code) return '';
  return '<img src="https://flagcdn.com/w20/' + code + '.png" class="flag-img" alt="' + team + '">';
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
