(function() {
  var RENDERERS = {
    sweep:        function() { APP.renderSweep(); },
    groups:       function() { APP.renderGroups(null); },
    bracket:      function() { APP.renderBracket(null); },
    participants: function() { APP.renderParticipants(); }
  };

  var activeTab = 'sweep';

  function switchTab(name) {
    if (!RENDERERS[name]) return;
    activeTab = name;

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === name);
    });
    document.querySelectorAll('.tab-panel').forEach(function(panel) {
      panel.classList.remove('active');
    });
    var panel = document.getElementById('tab-' + name);
    if (panel) panel.classList.add('active');

    RENDERERS[name]();
  }

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
  });

  APP.load().then(function() {
    var updated = APP.wc.lastUpdated;
    var updatedEl = document.getElementById('last-updated');
    if (updated) {
      var d = new Date(updated);
      updatedEl.textContent = 'Updated: ' + d.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
      });
    } else {
      updatedEl.textContent = 'Data not yet loaded';
    }
    switchTab('sweep');
  }).catch(function(err) {
    console.error('Failed to load data:', err);
    document.getElementById('tab-sweep').innerHTML =
      '<div class="empty-state">Failed to load data. Please try again later.</div>';
  });
})();
