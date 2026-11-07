/**
 * FF SQUAD ARENA — CORE APP LOGIC (ARENA X STYLE)
 * Clean English UI, Fast SPA Section Switching, Mobile-First
 * No Free Fire UID, IGN Only, Dynamic 1-6 Match Series
 */

let activeStandingsTab = 'overall';
let activeAdminMatchId = 'match-1';
let registerModalInstance = null;
let roomModalInstance = null;
let activeModalMatchId = 1;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Bootstrap modal setup
  const regEl = document.getElementById('registerModal');
  if (regEl && typeof bootstrap !== 'undefined') {
    registerModalInstance = new bootstrap.Modal(regEl);
  }

  const roomEl = document.getElementById('idPasswordModalEl');
  if (roomEl && typeof bootstrap !== 'undefined') {
    roomModalInstance = new bootstrap.Modal(roomEl);
  }

  // Register Form Submit
  const regForm = document.getElementById('quickRegisterForm');
  if (regForm) {
    regForm.addEventListener('submit', handleRegistrationSubmit);
  }

  // Subscribe to storage
  if (window.tourneyStorage) {
    window.tourneyStorage.subscribe((data) => {
      renderAll(data);
    });
  }
});

// SPA Section Switcher
window.switchSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));

  const targetSec = document.getElementById(sectionId);
  if (targetSec) targetSec.classList.add('active');

  const navMap = {
    'home-section': 0,
    'standings-section': 1,
    'slots-section': 2,
    'admin-section': 3
  };
  const navButtons = document.querySelectorAll('.bottom-nav .nav-item');
  const index = navMap[sectionId];
  if (index !== undefined && navButtons[index]) {
    navButtons[index].classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Render Everything
function renderAll(data) {
  if (!data) return;

  renderHome(data);
  renderStandings(data);
  renderSlots(data);
  renderAdmin(data);
  populateRegisterSlotOptions(data);
}

// 1. Home Section Render
function renderHome(data) {
  const booked = data.teams.filter(t => t.isBooked);
  
  const titleEl = document.getElementById('homeTourneyTitle');
  const entryFeeEl = document.getElementById('homeEntryFee');
  const prizePoolEl = document.getElementById('homePrizePool');
  const slotsRatioEl = document.getElementById('homeSlotsRatio');
  const matchesCountEl = document.getElementById('homeMatchesCount');

  if (titleEl) titleEl.textContent = data.meta.title;
  if (entryFeeEl) entryFeeEl.textContent = `৳${data.meta.entryFeeBDT}`;
  if (prizePoolEl) prizePoolEl.textContent = `৳${data.meta.prizePoolBDT}`;
  if (slotsRatioEl) slotsRatioEl.textContent = `${booked.length} / 12`;
  if (matchesCountEl) matchesCountEl.textContent = `${data.matches.length}`;

  // Render Series Matches List
  const container = document.getElementById('homeMatchesContainer');
  if (container) {
    container.innerHTML = '';
    data.matches.forEach(m => {
      const card = document.createElement('div');
      card.className = 'tournament-card p-3 mb-2';
      const isLive = m.status === 'live';
      const isDone = m.status === 'completed';
      const badgeColor = isDone ? 'bg-success' : isLive ? 'bg-danger' : 'bg-primary';

      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span class="badge ${badgeColor} me-1">Match #${m.matchNumber}</span>
            <strong class="text-white">${m.map} Map</strong>
          </div>
          <small class="text-secondary"><i class="bi bi-clock me-1"></i>${m.time || '9:00 PM'}</small>
        </div>
        <div class="d-flex justify-content-between align-items-center pt-1 border-top border-secondary border-opacity-25">
          <span class="small text-secondary">Status: <strong class="text-light">${m.status.toUpperCase()}</strong></span>
          <button class="btn btn-sm btn-outline-warning py-1 px-3" onclick="openRoomModalForMatch(${m.matchNumber})">
            <i class="bi bi-key-fill"></i> Room ID & Pass
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

// Open Room ID & Pass Modal for specific match
window.openRoomModalForMatch = function(matchNumber) {
  const data = window.tourneyStorage.data;
  if (!data) return;

  const targetMatch = data.matches.find(m => m.matchNumber === matchNumber) || data.matches[0];
  if (!targetMatch) return;

  activeModalMatchId = targetMatch.matchNumber;

  const labelEl = document.getElementById('modalMatchLabel');
  const idEl = document.getElementById('roomIdDisplayEl');
  const passEl = document.getElementById('roomPasswordDisplayEl');

  if (labelEl) labelEl.textContent = `Match #${targetMatch.matchNumber} (${targetMatch.map}) • ${targetMatch.time || '9:00 PM'}`;
  if (idEl) idEl.textContent = targetMatch.roomId || 'TBA';
  if (passEl) passEl.textContent = targetMatch.roomPassword || '••••';

  if (roomModalInstance) roomModalInstance.show();
};

window.copyModalField = function(type) {
  const data = window.tourneyStorage.data;
  const targetMatch = data.matches.find(m => m.matchNumber === activeModalMatchId) || data.matches[0];
  if (!targetMatch) return;

  const val = type === 'id' ? targetMatch.roomId : targetMatch.roomPassword;
  navigator.clipboard.writeText(val || '').then(() => {
    showToast(`Copied ${type === 'id' ? 'Room ID' : 'Password'}: ${val}`);
  });
};

// 2. Standings (Points Table) Render
function renderStandings(data) {
  const tabsContainer = document.getElementById('standingsTabs');
  const tableBody = document.getElementById('standingsTableBody');

  if (tabsContainer) {
    tabsContainer.innerHTML = '';

    // Overall Tab
    const overallBtn = document.createElement('button');
    overallBtn.className = `btn btn-sm ${activeStandingsTab === 'overall' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`;
    overallBtn.textContent = 'Overall Standings';
    overallBtn.onclick = () => {
      activeStandingsTab = 'overall';
      renderStandings(data);
    };
    tabsContainer.appendChild(overallBtn);

    // Each Match Tab
    data.matches.forEach(m => {
      const matchBtn = document.createElement('button');
      matchBtn.className = `btn btn-sm ${activeStandingsTab === m.id ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`;
      matchBtn.textContent = `M${m.matchNumber} (${m.map})`;
      matchBtn.onclick = () => {
        activeStandingsTab = m.id;
        renderStandings(data);
      };
      tabsContainer.appendChild(matchBtn);
    });
  }

  if (tableBody) {
    tableBody.innerHTML = '';

    if (activeStandingsTab === 'overall') {
      const standings = window.PointsEngine.calculateOverallStandings(data.teams, data.matches);

      standings.forEach(row => {
        const tr = document.createElement('tr');
        let rankClass = row.overallRank === 1 ? 'rank-1' : row.overallRank === 2 ? 'rank-2' : row.overallRank === 3 ? 'rank-3' : 'rank-other';

        tr.innerHTML = `
          <td><span class="rank-badge ${rankClass}">${row.overallRank}</span></td>
          <td>
            <strong>${row.teamName}</strong>
            <small class="text-secondary d-block" style="font-size: 0.7rem;">Slot #${row.slot} • ${row.captainName}</small>
          </td>
          <td>${row.matchesPlayed}</td>
          <td>${row.booyahs > 0 ? `<span class="badge bg-warning text-dark">👑 ${row.booyahs}</span>` : '-'}</td>
          <td>${row.totalKillPoints}</td>
          <td>${row.totalPlacePoints}</td>
          <td class="fw-bold text-warning">${row.totalPoints}</td>
        `;
        tableBody.appendChild(tr);
      });
    } else {
      const currentMatch = data.matches.find(m => m.id === activeStandingsTab);
      if (!currentMatch) return;

      const rows = [];
      data.teams.forEach(t => {
        const res = currentMatch.results ? currentMatch.results[t.id] : null;
        if (res) {
          const pts = window.PointsEngine.calculateMatchPoints(res.rank, res.kills);
          rows.push({
            slot: t.slot,
            teamName: t.teamName,
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

      rows.sort((a, b) => a.rank - b.rank);

      if (rows.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-secondary py-4">
              Match #${currentMatch.matchNumber} results not entered yet.
            </td>
          </tr>
        `;
        return;
      }

      rows.forEach(r => {
        const tr = document.createElement('tr');
        let rankClass = r.rank === 1 ? 'rank-1' : r.rank === 2 ? 'rank-2' : r.rank === 3 ? 'rank-3' : 'rank-other';

        tr.innerHTML = `
          <td><span class="rank-badge ${rankClass}">${r.rank}</span></td>
          <td>
            <strong>${r.teamName}</strong>
            <small class="text-secondary d-block" style="font-size: 0.7rem;">Slot #${r.slot}</small>
          </td>
          <td>1</td>
          <td>${r.isBooyah ? '<span class="badge bg-warning text-dark">👑 Booyah</span>' : '-'}</td>
          <td>${r.killPoints}</td>
          <td>${r.placePoints}</td>
          <td class="fw-bold text-warning">${r.totalPoints}</td>
        `;
        tableBody.appendChild(tr);
      });
    }
  }
}

// 3. Slots (1-12) Render - IGN ONLY, ZERO UID
function renderSlots(data) {
  const container = document.getElementById('slotsListContainer');
  if (!container) return;
  container.innerHTML = '';

  data.teams.forEach(team => {
    const card = document.createElement('div');
    card.className = `slot-row-card ${team.isBooked ? 'booked' : 'empty'}`;

    if (team.isBooked) {
      const chips = (team.players || []).map(p => `
        <span class="player-chip">
          ${p.isLeader ? '<i class="bi bi-star-fill text-warning"></i> ' : ''}${p.name}
        </span>
      `).join('');

      card.innerHTML = `
        <div style="flex-grow: 1;">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="slot-tag">SLOT #${team.slot}</span>
            <strong class="text-white">${team.teamName}</strong>
            <span class="badge bg-success ms-auto" style="font-size: 0.65rem;">BOOKED</span>
          </div>
          <div class="player-chips">${chips}</div>
          <small class="text-secondary d-block mt-1" style="font-size: 0.72rem;">
            Captain: ${team.captainName} (WhatsApp: ${team.captainWhatsApp})
          </small>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div style="flex-grow: 1;">
          <div class="d-flex align-items-center gap-2">
            <span class="slot-tag">SLOT #${team.slot}</span>
            <span class="text-secondary">Available</span>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-warning" onclick="openRegisterForSlot(${team.slot})">
          Book Slot
        </button>
      `;
    }

    container.appendChild(card);
  });
}

// 4. Admin Render
function renderAdmin(data) {
  // Sync series count select
  const countSelect = document.getElementById('adminSeriesCountSelect');
  if (countSelect) {
    countSelect.value = `${data.matches.length}`;
  }

  // Populate Admin Match Selector
  const selector = document.getElementById('adminMatchSelector');
  if (selector) {
    selector.innerHTML = '';
    data.matches.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `Match #${m.matchNumber} (${m.map})`;
      if (m.id === activeAdminMatchId) opt.selected = true;
      selector.appendChild(opt);
    });
  }

  // Load selected match details into inputs
  const currentMatch = data.matches.find(m => m.id === activeAdminMatchId) || data.matches[0];
  if (currentMatch) {
    activeAdminMatchId = currentMatch.id;
    const mapSelect = document.getElementById('adminMapSelect');
    const timeInp = document.getElementById('adminTimeInput');
    const idInp = document.getElementById('adminRoomIdInput');
    const passInp = document.getElementById('adminPassInput');

    if (mapSelect) mapSelect.value = currentMatch.map || 'Bermuda';
    if (timeInp) timeInp.value = currentMatch.time || '9:00 PM';
    if (idInp) idInp.value = currentMatch.roomId || '';
    if (passInp) passInp.value = currentMatch.roomPassword || '';
  }

  loadAdminScores(activeAdminMatchId);
  renderAdminTeams(data.teams);
}

// Dynamic Series Matches Count Changer (1 to 6)
window.changeTournamentMatchCount = function(count) {
  // Triggered on select change
};

window.applyMatchCount = function() {
  const count = parseInt(document.getElementById('adminSeriesCountSelect').value, 10);
  const data = window.tourneyStorage.data;
  if (!count || count < 1 || count > 6) return;

  const defaultMaps = ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra', 'Bermuda'];
  const newMatches = [];

  for (let i = 1; i <= count; i++) {
    const existing = data.matches.find(m => m.matchNumber === i);
    if (existing) {
      newMatches.push(existing);
    } else {
      newMatches.push({
        id: `match-${i}`,
        matchNumber: i,
        map: defaultMaps[(i - 1) % defaultMaps.length],
        time: `${8 + i}:00 PM`,
        roomId: `FF-SQUAD-${Math.floor(10000 + Math.random() * 90000)}`,
        roomPassword: `pass${i}2026`,
        status: 'upcoming',
        results: {}
      });
    }
  }

  data.matches = newMatches;
  data.meta.totalMatches = count;
  activeAdminMatchId = newMatches[0].id;

  window.tourneyStorage.sync(data);
  showToast(`Tournament updated to ${count} Matches Series!`);
};

// Load Scores for selected match in Admin
window.loadAdminScores = function(matchId) {
  activeAdminMatchId = matchId;
  const data = window.tourneyStorage.data;
  if (!data) return;

  const currentMatch = data.matches.find(m => m.id === matchId);
  if (currentMatch) {
    const mapSelect = document.getElementById('adminMapSelect');
    const timeInp = document.getElementById('adminTimeInput');
    const idInp = document.getElementById('adminRoomIdInput');
    const passInp = document.getElementById('adminPassInput');

    if (mapSelect) mapSelect.value = currentMatch.map || 'Bermuda';
    if (timeInp) timeInp.value = currentMatch.time || '9:00 PM';
    if (idInp) idInp.value = currentMatch.roomId || '';
    if (passInp) passInp.value = currentMatch.roomPassword || '';
  }

  const tbody = document.getElementById('adminScoreTableBody');
  if (!tbody || !currentMatch) return;
  tbody.innerHTML = '';

  data.teams.forEach(t => {
    const tr = document.createElement('tr');
    const existing = currentMatch.results ? currentMatch.results[t.id] : null;
    const rankVal = existing ? existing.rank : '';
    const killsVal = existing ? existing.kills : '0';

    let ptsText = '-';
    if (existing) {
      const p = window.PointsEngine.calculateMatchPoints(existing.rank, existing.kills);
      ptsText = `${p.totalPoints} PTS`;
    }

    tr.innerHTML = `
      <td><span class="slot-tag">S#${t.slot}</span></td>
      <td><strong>${t.teamName || '(Empty)'}</strong></td>
      <td>
        <input type="number" min="1" max="12" class="form-control form-control-sm text-center" 
               id="adm_rank_${t.id}" value="${rankVal}" placeholder="1-12">
      </td>
      <td>
        <input type="number" min="0" class="form-control form-control-sm text-center" 
               id="adm_kills_${t.id}" value="${killsVal}">
      </td>
      <td class="fw-bold text-warning">${ptsText}</td>
    `;
    tbody.appendChild(tr);
  });
};

// Save Admin Scores for the active match
window.saveAdminScores = function() {
  const data = window.tourneyStorage.data;
  const currentMatch = data.matches.find(m => m.id === activeAdminMatchId);
  if (!currentMatch) return;

  if (!currentMatch.results) currentMatch.results = {};

  data.teams.forEach(t => {
    const rankEl = document.getElementById(`adm_rank_${t.id}`);
    const killsEl = document.getElementById(`adm_kills_${t.id}`);

    if (rankEl && rankEl.value) {
      const rank = parseInt(rankEl.value, 10);
      const kills = parseInt(killsEl.value, 10) || 0;
      currentMatch.results[t.id] = { rank, kills };
    } else {
      delete currentMatch.results[t.id];
    }
  });

  currentMatch.status = 'completed';
  window.tourneyStorage.sync(data);
  showToast(`Match #${currentMatch.matchNumber} results saved & standings updated!`);
};

// Save Admin Room Credentials for the selected match
window.saveAdminRoomCreds = function() {
  const data = window.tourneyStorage.data;
  const currentMatch = data.matches.find(m => m.id === activeAdminMatchId);
  if (!currentMatch) return;

  currentMatch.map = document.getElementById('adminMapSelect').value;
  currentMatch.time = document.getElementById('adminTimeInput').value.trim() || '9:00 PM';
  currentMatch.roomId = document.getElementById('adminRoomIdInput').value.trim();
  currentMatch.roomPassword = document.getElementById('adminPassInput').value.trim();

  window.tourneyStorage.sync(data);
  showToast(`Room ID & Password saved for Match #${currentMatch.matchNumber}!`);
};

// Render Admin Teams List
function renderAdminTeams(teams) {
  const container = document.getElementById('adminTeamsList');
  if (!container) return;
  container.innerHTML = '';

  teams.forEach(t => {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center gap-2 mb-2 p-2 rounded bg-dark border border-secondary border-opacity-25';
    row.innerHTML = `
      <span class="slot-tag">S#${t.slot}</span>
      <input type="text" class="form-control form-control-sm" id="adm_tname_${t.id}" value="${t.teamName || ''}" placeholder="Team Name">
      <input type="text" class="form-control form-control-sm" id="adm_tphone_${t.id}" value="${t.captainWhatsApp || ''}" placeholder="WhatsApp">
      <button class="btn btn-sm btn-primary" onclick="saveAdminSingleTeam('${t.id}')">Save</button>
    `;
    container.appendChild(row);
  });
}

window.saveAdminSingleTeam = function(teamId) {
  const data = window.tourneyStorage.data;
  const target = data.teams.find(t => t.id === teamId);
  if (!target) return;

  const name = document.getElementById(`adm_tname_${teamId}`).value.trim();
  const phone = document.getElementById(`adm_tphone_${teamId}`).value.trim();

  target.teamName = name;
  target.captainWhatsApp = phone;
  target.isBooked = name.length > 0;

  window.tourneyStorage.sync(data);
  showToast(`Slot #${target.slot} updated!`);
};

// Slot Registration Form Handlers (NO UID, ONLY IGN)
function populateRegisterSlotOptions(data, preselectSlot = null) {
  const select = document.getElementById('regSlotSelect');
  if (!select) return;
  select.innerHTML = '';

  data.teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.slot;
    if (t.isBooked) {
      opt.disabled = true;
      opt.textContent = `Slot #${t.slot} - [Booked: ${t.teamName}]`;
    } else {
      opt.textContent = `Slot #${t.slot} - Available`;
      if (preselectSlot === t.slot) opt.selected = true;
    }
    select.appendChild(opt);
  });
}

window.openRegisterModal = function() {
  const data = window.tourneyStorage.data;
  populateRegisterSlotOptions(data);
  if (registerModalInstance) registerModalInstance.show();
};

window.openRegisterForSlot = function(slot) {
  const data = window.tourneyStorage.data;
  populateRegisterSlotOptions(data, slot);
  if (registerModalInstance) registerModalInstance.show();
};

function handleRegistrationSubmit(e) {
  e.preventDefault();
  const slotNumber = parseInt(document.getElementById('regSlotSelect').value, 10);
  const teamName = document.getElementById('regTeamName').value.trim();
  const captainName = document.getElementById('regCaptainName').value.trim();
  const captainPhone = document.getElementById('regCaptainPhone').value.trim();

  const p1Name = document.getElementById('regP1Name').value.trim();
  const p2Name = document.getElementById('regP2Name').value.trim();
  const p3Name = document.getElementById('regP3Name').value.trim();
  const p4Name = document.getElementById('regP4Name').value.trim();

  const data = window.tourneyStorage.data;
  const target = data.teams.find(t => t.slot === slotNumber);
  if (!target) return;

  target.teamName = teamName;
  target.captainName = captainName;
  target.captainWhatsApp = captainPhone;
  target.isBooked = true;
  target.players = [
    { name: p1Name, isLeader: true },
    { name: p2Name, isLeader: false },
    { name: p3Name, isLeader: false },
    { name: p4Name, isLeader: false }
  ];

  window.tourneyStorage.sync(data);

  if (registerModalInstance) registerModalInstance.hide();
  document.getElementById('quickRegisterForm').reset();
  showToast(`Team ${teamName} registered in Slot #${slotNumber}!`);
  switchSection('slots-section');
}

// 1-Click WhatsApp Share
window.shareWhatsAppReport = function() {
  const data = window.tourneyStorage.data;
  if (!data) return;

  const completed = data.matches.filter(m => m.status === 'completed').length;
  const standings = window.PointsEngine.calculateOverallStandings(data.teams, data.matches);
  const text = window.PointsEngine.generateWhatsAppReport(data.meta.title, standings, completed, data.matches.length);

  navigator.clipboard.writeText(text).then(() => {
    showToast('Standings copied! Paste into WhatsApp/FB group.');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  });
};

// Reset Default Data
window.resetDefaultData = function() {
  if (confirm('Reset all match scores and teams to default?')) {
    window.tourneyStorage.resetToDefault();
    showToast('Data reset to default.');
  }
};

// Toast Helper
function showToast(msg) {
  const toast = document.getElementById('appToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}
