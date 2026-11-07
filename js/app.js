/**
 * FF SQUAD ARENA — CORE APP LOGIC
 * Coordinates:
 *  - Real-time Points Table & Standings display
 *  - 12-Slot Squad Grid
 *  - Dynamic Series Match Tabs
 *  - 1-Click Copy Room ID & Password
 *  - 1-Click WhatsApp / Facebook Points Table sharing
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on index.html
  const pointsTableBody = document.getElementById('pointsTableBody');
  const slotsGrid = document.getElementById('slotsGrid');
  const matchTabs = document.getElementById('matchTabs');
  const activeTabTitle = document.getElementById('activeTabTitle');
  
  let currentActiveTab = 'overall'; // 'overall' or matchId

  // Listen to Storage updates
  if (window.tourneyStorage) {
    window.tourneyStorage.subscribe((data) => {
      renderApp(data);
    });
  }

  function renderApp(data) {
    if (!data) return;

    // 1. Render Meta Header
    const tournamentTitle = document.getElementById('tournamentTitle');
    const tournamentRules = document.getElementById('tournamentRules');
    const registeredTeamsCount = document.getElementById('registeredTeamsCount');
    const totalPrizePool = document.getElementById('totalPrizePool');
    const totalMatchesCount = document.getElementById('totalMatchesCount');

    const bookedTeams = data.teams.filter(t => t.isBooked);

    if (tournamentTitle) tournamentTitle.textContent = data.meta.title;
    if (tournamentRules) tournamentRules.textContent = data.meta.rules;
    if (registeredTeamsCount) registeredTeamsCount.textContent = `${bookedTeams.length} / 12`;
    if (totalPrizePool) totalPrizePool.textContent = `৳${data.meta.prizePoolBDT}`;
    if (totalMatchesCount) totalMatchesCount.textContent = `${data.matches.length} Matches`;

    // 2. Render Room Vault Banner
    renderRoomVault(data.roomCredentials);

    // 3. Render Match Tabs
    renderTabs(data);

    // 4. Render Table (Based on current active tab)
    renderPointsTable(data, currentActiveTab);

    // 5. Render 12-Slot Squad Grid
    renderSlotsGrid(data.teams);
  }

  function renderRoomVault(creds) {
    const roomIdEl = document.getElementById('vaultRoomId');
    const roomPassEl = document.getElementById('vaultRoomPass');
    const roomMapEl = document.getElementById('vaultMap');
    const roomTimeEl = document.getElementById('vaultTime');

    if (roomIdEl && creds) roomIdEl.textContent = creds.roomId || 'Not Released';
    if (roomPassEl && creds) roomPassEl.textContent = creds.roomPassword || '••••••';
    if (roomMapEl && creds) roomMapEl.textContent = creds.map || 'Bermuda';
    if (roomTimeEl && creds) roomTimeEl.textContent = creds.matchTime || 'TBA';
  }

  function renderTabs(data) {
    if (!matchTabs) return;
    matchTabs.innerHTML = '';

    // Overall Tab
    const overallBtn = document.createElement('button');
    overallBtn.className = `tab-btn ${currentActiveTab === 'overall' ? 'active' : ''}`;
    overallBtn.textContent = '🏆 Overall Standings';
    overallBtn.onclick = () => {
      currentActiveTab = 'overall';
      renderTabs(data);
      renderPointsTable(data, 'overall');
    };
    matchTabs.appendChild(overallBtn);

    // Match Specific Tabs
    data.matches.forEach(m => {
      const matchBtn = document.createElement('button');
      matchBtn.className = `tab-btn ${currentActiveTab === m.id ? 'active' : ''}`;
      const statusIcon = m.status === 'completed' ? '✓' : '⏱';
      matchBtn.textContent = `Match #${m.matchNumber} (${m.map}) ${statusIcon}`;
      matchBtn.onclick = () => {
        currentActiveTab = m.id;
        renderTabs(data);
        renderPointsTable(data, m.id);
      };
      matchTabs.appendChild(matchBtn);
    });
  }

  function renderPointsTable(data, activeTab) {
    if (!pointsTableBody) return;
    pointsTableBody.innerHTML = '';

    if (activeTab === 'overall') {
      if (activeTabTitle) activeTabTitle.textContent = 'Overall Tournament Standings (Total Points)';

      const standings = window.PointsEngine.calculateOverallStandings(data.teams, data.matches);

      standings.forEach(row => {
        const tr = document.createElement('tr');

        // Rank Badge
        let rankClass = 'rank-other';
        if (row.overallRank === 1) rankClass = 'rank-1';
        else if (row.overallRank === 2) rankClass = 'rank-2';
        else if (row.overallRank === 3) rankClass = 'rank-3';

        tr.innerHTML = `
          <td>
            <span class="rank-badge ${rankClass}">#${row.overallRank}</span>
          </td>
          <td>
            <div class="team-cell">
              <div class="team-avatar">S${row.slot}</div>
              <div class="team-details">
                <h4>${row.teamName}</h4>
                <p>Leader: ${row.captainName}</p>
              </div>
            </div>
          </td>
          <td><strong>${row.matchesPlayed}</strong></td>
          <td>
            ${row.booyahs > 0 ? `<span class="booyah-badge">👑 ${row.booyahs} Booyah</span>` : '<span style="color: var(--text-muted);">-</span>'}
          </td>
          <td><span style="font-family: var(--font-mono);">${row.totalKillPoints} pts</span></td>
          <td><span style="font-family: var(--font-mono);">${row.totalPlacePoints} pts</span></td>
          <td><span class="pts-highlight">${row.totalPoints} PTS</span></td>
        `;
        pointsTableBody.appendChild(tr);
      });

    } else {
      // Single Match Breakdown
      const currentMatch = data.matches.find(m => m.id === activeTab);
      if (!currentMatch) return;

      if (activeTabTitle) activeTabTitle.textContent = `Match #${currentMatch.matchNumber} Results (${currentMatch.map})`;

      const matchRows = [];
      data.teams.forEach(t => {
        const res = currentMatch.results ? currentMatch.results[t.id] : null;
        if (res) {
          const pts = window.PointsEngine.calculateMatchPoints(res.rank, res.kills);
          matchRows.push({
            slot: t.slot,
            teamName: t.teamName || `Slot #${t.slot}`,
            captainName: t.captainName,
            rank: pts.rank,
            kills: pts.kills,
            placePoints: pts.placePoints,
            killPoints: pts.killPoints,
            totalPoints: pts.totalPoints,
            isBooyah: pts.isBooyah
          });
        }
      });

      // Sort by Match Rank
      matchRows.sort((a, b) => a.rank - b.rank);

      if (matchRows.length === 0) {
        pointsTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 28px; color: var(--text-muted);">
              ⏳ Match #${currentMatch.matchNumber} results have not been published by the organizer yet.
            </td>
          </tr>
        `;
        return;
      }

      matchRows.forEach(row => {
        const tr = document.createElement('tr');
        let rankClass = row.rank === 1 ? 'rank-1' : row.rank === 2 ? 'rank-2' : row.rank === 3 ? 'rank-3' : 'rank-other';

        tr.innerHTML = `
          <td><span class="rank-badge ${rankClass}">#${row.rank}</span></td>
          <td>
            <div class="team-cell">
              <div class="team-avatar">S${row.slot}</div>
              <div class="team-details">
                <h4>${row.teamName}</h4>
                <p>Leader: ${row.captainName}</p>
              </div>
            </div>
          </td>
          <td>1</td>
          <td>${row.isBooyah ? '<span class="booyah-badge">👑 1 Booyah</span>' : '<span style="color: var(--text-muted);">-</span>'}</td>
          <td><span style="font-family: var(--font-mono);">${row.killPoints} pts (${row.kills} kills)</span></td>
          <td><span style="font-family: var(--font-mono);">${row.placePoints} pts</span></td>
          <td><span class="pts-highlight">${row.totalPoints} PTS</span></td>
        `;
        pointsTableBody.appendChild(tr);
      });
    }
  }

  function renderSlotsGrid(teams) {
    if (!slotsGrid) return;
    slotsGrid.innerHTML = '';

    teams.forEach(team => {
      const card = document.createElement('div');
      card.className = `slot-card ${team.isBooked ? 'booked' : 'empty'}`;

      if (team.isBooked) {
        const playersHtml = (team.players || []).map(p => `
          <div class="player-item ${p.isLeader ? 'leader' : ''}">
            <span>${p.isLeader ? '👑 ' : ''}${p.name}</span>
            <span class="player-uid">UID: ${p.uid}</span>
          </div>
        `).join('');

        card.innerHTML = `
          <div class="slot-header">
            <span class="slot-number">SLOT #${team.slot}</span>
            <span class="slot-status-booked">✓ Confirmed</span>
          </div>
          <h4 class="slot-team-title">${team.teamName}</h4>
          <div class="player-list">
            ${playersHtml}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>Captain: ${team.captainName}</span>
            <span>📱 ${team.captainWhatsApp}</span>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="slot-header">
            <span class="slot-number">SLOT #${team.slot}</span>
            <span class="slot-status-empty">Available</span>
          </div>
          <h4 class="slot-team-title" style="color: var(--text-muted);">Slot #${team.slot} is Empty</h4>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px;">
            Squad registration is open for this slot.
          </p>
          <a href="register.html?slot=${team.slot}" class="nav-btn nav-btn-primary" style="display: block; text-align: center;">
            Register Team in Slot #${team.slot}
          </a>
        `;
      }

      slotsGrid.appendChild(card);
    });
  }

  // Copy Vault Credential Handlers
  window.copyVaultText = function(type) {
    const data = window.tourneyStorage.data;
    if (!data || !data.roomCredentials) return;

    const textToCopy = type === 'id' ? data.roomCredentials.roomId : data.roomCredentials.roomPassword;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`Copied ${type === 'id' ? 'Room ID' : 'Password'}: ${textToCopy}`);
    });
  };

  // 1-Click WhatsApp Report Sharing
  window.shareToWhatsApp = function() {
    const data = window.tourneyStorage.data;
    if (!data) return;

    const completedMatches = data.matches.filter(m => m.status === 'completed').length;
    const standings = window.PointsEngine.calculateOverallStandings(data.teams, data.matches);
    const reportText = window.PointsEngine.generateWhatsAppReport(
      data.meta.title,
      standings,
      completedMatches,
      data.matches.length
    );

    navigator.clipboard.writeText(reportText).then(() => {
      showToast('📋 Standings copied! Paste into WhatsApp or Facebook Group.');
      // Optionally open WhatsApp Web
      const encoded = encodeURIComponent(reportText);
      const url = `https://wa.me/?text=${encoded}`;
      window.open(url, '_blank');
    });
  };

  function showToast(msg) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
});
