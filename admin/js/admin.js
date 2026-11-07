// ==================================================
// ARENA X - Admin Panel Real-Time Firestore Logic
// ==================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBwoL8nXUevPWciB1cyjez5Bi_V9bYc98",
  authDomain: "ff-squad-arena-bd.firebaseapp.com",
  projectId: "ff-squad-arena-bd",
  storageBucket: "ff-squad-arena-bd.firebasestorage.app",
  messagingSenderId: "604500327184",
  appId: "1:604500327184:web:2eae6bfddea7ed2ae74395"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TOURNAMENT_DOC_ID = "ff-daily-squad";

// Default State
let tournamentData = {
  title: "Free Fire Daily Squad Championship",
  status: "upcoming",
  entryFee: 100,
  prizePool: 1000,
  matchCount: 3,
  matches: [
    { matchNumber: 1, map: "Bermuda", time: "08:00 PM", roomId: "893411", roomPass: "7788", status: "upcoming" },
    { matchNumber: 2, map: "Purgatory", time: "08:45 PM", roomId: "", roomPass: "", status: "upcoming" },
    { matchNumber: 3, map: "Kalahari", time: "09:30 PM", roomId: "", roomPass: "", status: "upcoming" },
    { matchNumber: 4, map: "Bermuda", time: "10:15 PM", roomId: "", roomPass: "", status: "upcoming" },
    { matchNumber: 5, map: "Purgatory", time: "11:00 PM", roomId: "", roomPass: "", status: "upcoming" },
    { matchNumber: 6, map: "Alpine", time: "11:45 PM", roomId: "", roomPass: "", status: "upcoming" }
  ],
  slots: Array.from({ length: 12 }, (_, i) => ({
    slotNumber: i + 1,
    booked: i === 0 || i === 1,
    squadName: i === 0 ? "DARK VORTEX" : (i === 1 ? "71 ESPL" : ""),
    leaderIgn: i === 0 ? "Vortex_Boss" : (i === 1 ? "71_Tiger" : ""),
    player2: i === 0 ? "Vortex_Fire" : (i === 1 ? "71_Sifat" : ""),
    player3: i === 0 ? "Vortex_Sniper" : (i === 1 ? "71_Shooter" : ""),
    player4: i === 0 ? "Vortex_Ghost" : (i === 1 ? "71_Storm" : ""),
    contact: i === 0 ? "01711000001" : (i === 1 ? "01791357521" : "")
  })),
  standings: [
    { rank: 1, squadName: "DARK VORTEX", matches: 1, kills: 8, pts: 20 },
    { rank: 2, squadName: "71 ESPL", matches: 1, kills: 5, pts: 14 }
  ],
  results: {}
};

// UI Helpers
const $ = (id) => document.getElementById(id);

function showToast(msg) {
  const toastEl = $('adminToast');
  const msgEl = $('adminToastMessage');
  if (msgEl) msgEl.textContent = msg;
  if (toastEl && window.bootstrap) {
    const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
    toast.show();
  }
}

// FFWS Placement Point Table (Official)
const FFWS_RANK_POINTS = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
  11: 0,
  12: 0
};

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.admin-tab').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.admin-nav-pills .nav-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === tabId);
  });
  const target = $(tabId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Render Matches & Room ID Config Form (1-6 Matches)
function renderMatchConfigForm() {
  const select = $('seriesMatchCountSelect');
  const count = Number(select?.value || tournamentData.matchCount || 3);
  const container = $('matchesContainer');
  if (!container) return;

  const maps = ["Bermuda", "Purgatory", "Kalahari", "Alpine", "Nexterra"];
  const matches = tournamentData.matches || [];

  let html = '';
  for (let i = 1; i <= count; i++) {
    const existing = matches.find(m => m.matchNumber === i) || {
      matchNumber: i,
      map: maps[(i - 1) % maps.length],
      time: `0${7 + i}:00 PM`,
      roomId: '',
      roomPass: '1234',
      status: 'upcoming'
    };

    html += `
      <div class="match-config-card" data-match-number="${i}">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="fw-bold text-white fs-6">
            <i class="bi bi-crosshair text-warning me-1"></i> Match ${i} Configuration
          </div>
          <span class="badge bg-secondary">Match #${i}</span>
        </div>

        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small text-secondary">Map</label>
            <select class="form-select form-select-sm match-map-input">
              ${maps.map(mp => `<option value="${mp}" ${existing.map === mp ? 'selected' : ''}>${mp}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-secondary">Match Time</label>
            <input type="text" class="form-control form-select-sm match-time-input" value="${existing.time || ''}" placeholder="08:00 PM">
          </div>
          <div class="col-md-3">
            <label class="form-label small text-secondary">Room ID</label>
            <input type="text" class="form-control form-select-sm match-roomid-input" value="${existing.roomId || ''}" placeholder="e.g. 892341">
          </div>
          <div class="col-md-3">
            <label class="form-label small text-secondary">Password</label>
            <input type="text" class="form-control form-select-sm match-roompass-input" value="${existing.roomPass || ''}" placeholder="e.g. 1234">
          </div>
        </div>

        <div class="row g-2 mt-1">
          <div class="col-md-4">
            <label class="form-label small text-secondary">Status</label>
            <select class="form-select form-select-sm match-status-input">
              <option value="upcoming" ${existing.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
              <option value="live" ${existing.status === 'live' ? 'selected' : ''}>Live</option>
              <option value="completed" ${existing.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Update Match Selector in Tab 3 (Results)
  const resSelect = $('resultMatchSelector');
  if (resSelect) {
    const curVal = resSelect.value || "1";
    resSelect.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Match ${i}`;
      if (Number(curVal) === i) opt.selected = true;
      resSelect.appendChild(opt);
    }
  }
}

// Save Matches & Room IDs to Firestore
async function handleSaveMatches(e) {
  e.preventDefault();
  const count = Number($('seriesMatchCountSelect').value);
  const cards = document.querySelectorAll('#matchesContainer .match-config-card');
  const updatedMatches = [];

  cards.forEach(card => {
    const num = Number(card.dataset.matchNumber);
    const map = card.querySelector('.match-map-input').value;
    const time = card.querySelector('.match-time-input').value.trim();
    const roomId = card.querySelector('.match-roomid-input').value.trim();
    const roomPass = card.querySelector('.match-roompass-input').value.trim();
    const status = card.querySelector('.match-status-input').value;

    updatedMatches.push({
      matchNumber: num,
      map,
      time,
      roomId,
      roomPass,
      status
    });
  });

  const btn = $('saveMatchesBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Saving...';

  try {
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    await updateDoc(docRef, {
      matchCount: count,
      matches: updatedMatches
    });
    showToast("Match series & Room credentials updated!");
  } catch (err) {
    console.error("Save matches error:", err);
    alert("Failed to save matches: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-save-fill"></i> Save Match & Room Details';
  }
}

// Render Slots Manager Tab
function renderSlotsManager() {
  const tbody = $('adminSlotsTableBody');
  if (!tbody) return;

  const slots = tournamentData.slots || [];
  const bookedCount = slots.filter(s => s.booked).length;
  if ($('adminBookedCountBadge')) {
    $('adminBookedCountBadge').textContent = `${bookedCount} / 12 Booked`;
  }

  tbody.innerHTML = slots.map(slot => {
    if (slot.booked) {
      return `
        <tr>
          <td><span class="badge bg-success">Slot ${slot.slotNumber}</span></td>
          <td class="fw-bold text-white">${slot.squadName || 'N/A'}</td>
          <td class="text-warning">${slot.leaderIgn || 'N/A'}</td>
          <td class="small text-secondary">
            ${[slot.player2, slot.player3, slot.player4].filter(Boolean).join(', ') || 'None'}
          </td>
          <td><small class="text-secondary">${slot.contact || 'N/A'}</small></td>
          <td>
            <button class="btn btn-sm btn-outline-info edit-slot-btn me-1" data-slot="${slot.slotNumber}">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger clear-inline-btn" data-slot="${slot.slotNumber}" title="Vacate Slot">
              <i class="bi bi-trash3"></i>
            </button>
          </td>
        </tr>
      `;
    } else {
      return `
        <tr class="opacity-75">
          <td><span class="badge bg-secondary">Slot ${slot.slotNumber}</span></td>
          <td class="text-secondary fst-italic">Available</td>
          <td class="text-secondary">-</td>
          <td class="text-secondary">-</td>
          <td class="text-secondary">-</td>
          <td>
            <button class="btn btn-sm btn-outline-warning edit-slot-btn" data-slot="${slot.slotNumber}">
              <i class="bi bi-plus-lg"></i> Assign
            </button>
          </td>
        </tr>
      `;
    }
  }).join('');

  // Wire buttons
  tbody.querySelectorAll('.edit-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditSlotModal(Number(btn.dataset.slot)));
  });

  tbody.querySelectorAll('.clear-inline-btn').forEach(btn => {
    btn.addEventListener('click', () => clearSlot(Number(btn.dataset.slot)));
  });
}

// Open Edit Slot Modal
function openEditSlotModal(slotNum) {
  const slot = (tournamentData.slots || []).find(s => s.slotNumber === slotNum);
  if (!slot) return;

  $('editSlotNumberHidden').value = slotNum;
  $('editSquadModalTitle').textContent = `Manage Slot #${slotNum}`;
  $('editSquadNameInput').value = slot.squadName || '';
  $('editLeaderIgnInput').value = slot.leaderIgn || '';
  $('editPlayer2Input').value = slot.player2 || '';
  $('editPlayer3Input').value = slot.player3 || '';
  $('editPlayer4Input').value = slot.player4 || '';
  $('editContactInput').value = slot.contact || '';

  if (window.bootstrap) {
    const modal = new bootstrap.Modal($('editSquadModal'));
    modal.show();
  }
}

// Save Edited Slot to Firestore
async function handleSaveEditedSlot(e) {
  e.preventDefault();
  const slotNum = Number($('editSlotNumberHidden').value);
  const squadName = $('editSquadNameInput').value.trim();
  const leaderIgn = $('editLeaderIgnInput').value.trim();
  const player2 = $('editPlayer2Input').value.trim();
  const player3 = $('editPlayer3Input').value.trim();
  const player4 = $('editPlayer4Input').value.trim();
  const contact = $('editContactInput').value.trim();

  const currentSlots = [...(tournamentData.slots || [])];
  const idx = currentSlots.findIndex(s => s.slotNumber === slotNum);
  if (idx === -1) return;

  currentSlots[idx] = {
    slotNumber: slotNum,
    booked: true,
    squadName,
    leaderIgn,
    player2,
    player3,
    player4,
    contact
  };

  try {
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    await updateDoc(docRef, { slots: currentSlots });
    showToast(`Slot ${slotNum} saved!`);
    if (window.bootstrap) {
      bootstrap.Modal.getInstance($('editSquadModal'))?.hide();
    }
  } catch (err) {
    alert("Error updating slot: " + err.message);
  }
}

// Clear / Vacate a Slot
async function clearSlot(slotNum) {
  if (!confirm(`Are you sure you want to clear and vacate Slot #${slotNum}?`)) return;

  const currentSlots = [...(tournamentData.slots || [])];
  const idx = currentSlots.findIndex(s => s.slotNumber === slotNum);
  if (idx === -1) return;

  currentSlots[idx] = {
    slotNumber: slotNum,
    booked: false,
    squadName: "",
    leaderIgn: "",
    player2: "",
    player3: "",
    player4: "",
    contact: ""
  };

  try {
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    await updateDoc(docRef, { slots: currentSlots });
    showToast(`Slot #${slotNum} is now vacant.`);
    if (window.bootstrap) {
      const modalEl = $('editSquadModal');
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
  } catch (err) {
    alert("Error clearing slot: " + err.message);
  }
}

// Render Results Entry Tab
function renderResultsEntry() {
  const tbody = $('adminResultsTableBody');
  if (!tbody) return;

  const matchNum = $('resultMatchSelector')?.value || "1";
  const bookedSlots = (tournamentData.slots || []).filter(s => s.booked);

  if (!bookedSlots.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">No squads booked yet. Book slots first!</td></tr>`;
    return;
  }

  const existingResults = (tournamentData.results && tournamentData.results[`match${matchNum}`]) || [];

  tbody.innerHTML = bookedSlots.map((slot, idx) => {
    const res = existingResults.find(r => r.slotNumber === slot.slotNumber) || {};
    const rank = res.rank || (idx + 1);
    const kills = res.kills !== undefined ? res.kills : 0;
    const rankPts = FFWS_RANK_POINTS[rank] || 0;
    const totalPts = rankPts + kills;

    return `
      <tr class="result-row" data-slot="${slot.slotNumber}" data-squad="${slot.squadName}">
        <td><span class="badge bg-warning text-dark">#${slot.slotNumber}</span></td>
        <td class="fw-bold text-white">${slot.squadName}</td>
        <td>
          <select class="form-select form-select-sm result-rank-select">
            ${Array.from({ length: 12 }, (_, i) => i + 1).map(r => `
              <option value="${r}" ${r === rank ? 'selected' : ''}>Rank ${r} (${FFWS_RANK_POINTS[r]} pts)</option>
            `).join('')}
          </select>
        </td>
        <td>
          <input type="number" class="form-control form-control-sm result-kills-input" min="0" value="${kills}">
        </td>
        <td class="fw-bold text-warning result-pts-preview">${totalPts}</td>
      </tr>
    `;
  }).join('');

  // Wire live calculation of pts preview
  tbody.querySelectorAll('.result-row').forEach(row => {
    const rankSelect = row.querySelector('.result-rank-select');
    const killsInput = row.querySelector('.result-kills-input');
    const ptsPreview = row.querySelector('.result-pts-preview');

    const updatePreview = () => {
      const r = Number(rankSelect.value);
      const k = Number(killsInput.value) || 0;
      ptsPreview.textContent = (FFWS_RANK_POINTS[r] || 0) + k;
    };

    rankSelect.addEventListener('change', updatePreview);
    killsInput.addEventListener('input', updatePreview);
  });
}

// Save Match Results and Calculate Standings
async function handleSaveResults(e) {
  e.preventDefault();
  const matchNum = $('resultMatchSelector').value;
  const rows = document.querySelectorAll('#adminResultsTableBody .result-row');

  const matchResults = [];
  rows.forEach(row => {
    const slotNumber = Number(row.dataset.slot);
    const squadName = row.dataset.squad;
    const rank = Number(row.querySelector('.result-rank-select').value);
    const kills = Number(row.querySelector('.result-kills-input').value) || 0;
    const pts = (FFWS_RANK_POINTS[rank] || 0) + kills;

    matchResults.push({ slotNumber, squadName, rank, kills, pts });
  });

  const updatedResults = { ...(tournamentData.results || {}) };
  updatedResults[`match${matchNum}`] = matchResults;

  // Calculate Overall Standings Across All Matches
  const squadAgg = {};
  Object.values(updatedResults).forEach(matchList => {
    if (Array.isArray(matchList)) {
      matchList.forEach(entry => {
        if (!squadAgg[entry.squadName]) {
          squadAgg[entry.squadName] = { squadName: entry.squadName, matches: 0, kills: 0, pts: 0 };
        }
        squadAgg[entry.squadName].matches += 1;
        squadAgg[entry.squadName].kills += entry.kills;
        squadAgg[entry.squadName].pts += entry.pts;
      });
    }
  });

  const overallStandings = Object.values(squadAgg)
    .sort((a, b) => b.pts - a.pts || b.kills - a.kills)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const btn = $('saveResultsBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Publishing...';

  try {
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    await updateDoc(docRef, {
      results: updatedResults,
      standings: overallStandings
    });
    showToast(`Match ${matchNum} results published live!`);
  } catch (err) {
    console.error("Save results error:", err);
    alert("Failed to publish results: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-broadcast"></i> Publish Standings Live';
  }
}

// Tournament Settings Update
async function handleUpdateSettings(e) {
  e.preventDefault();
  const title = $('settingsTitleInput').value.trim();
  const entryFee = Number($('settingsEntryFeeInput').value);
  const prizePool = Number($('settingsPrizePoolInput').value);
  const status = $('settingsStatusSelect').value;

  try {
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    await updateDoc(docRef, { title, entryFee, prizePool, status });
    showToast("Tournament settings updated!");
  } catch (err) {
    alert("Failed to update settings: " + err.message);
  }
}

// Setup Event Listeners
function setupEvents() {
  // Navigation Pills
  document.querySelectorAll('.admin-nav-pills .nav-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  // Series match count change
  $('seriesMatchCountSelect')?.addEventListener('change', renderMatchConfigForm);

  // Forms
  $('matchSeriesForm')?.addEventListener('submit', handleSaveMatches);
  $('editSquadForm')?.addEventListener('submit', handleSaveEditedSlot);
  $('clearSlotBtn')?.addEventListener('click', () => {
    const slotNum = Number($('editSlotNumberHidden').value);
    clearSlot(slotNum);
  });
  $('resultMatchSelector')?.addEventListener('change', renderResultsEntry);
  $('matchResultsForm')?.addEventListener('submit', handleSaveResults);
  $('tournamentSettingsForm')?.addEventListener('submit', handleUpdateSettings);
}

// Real-Time Firestore Sync
function initRealtimeSync() {
  try {
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        tournamentData = { ...tournamentData, ...snap.data() };
        if ($('seriesMatchCountSelect')) {
          $('seriesMatchCountSelect').value = tournamentData.matchCount || 3;
        }
        if ($('settingsTitleInput')) $('settingsTitleInput').value = tournamentData.title || '';
        if ($('settingsEntryFeeInput')) $('settingsEntryFeeInput').value = tournamentData.entryFee || 100;
        if ($('settingsPrizePoolInput')) $('settingsPrizePoolInput').value = tournamentData.prizePool || 1000;
        if ($('settingsStatusSelect')) $('settingsStatusSelect').value = tournamentData.status || 'upcoming';

        renderMatchConfigForm();
        renderSlotsManager();
        renderResultsEntry();
      } else {
        setDoc(docRef, tournamentData);
        renderMatchConfigForm();
        renderSlotsManager();
        renderResultsEntry();
      }
    }, (err) => {
      console.warn("Admin onSnapshot error:", err);
    });
  } catch (e) {
    console.warn("initRealtimeSync failed to attach:", e);
  }
}

// Instant Initialization
function init() {
  setupEvents();
  renderMatchConfigForm();
  renderSlotsManager();
  renderResultsEntry();
  initRealtimeSync();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
