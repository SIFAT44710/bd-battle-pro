// ==================================================
// ARENA X - User Panel Real-Time Firestore Logic
// ==================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  updateDoc 
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

// Default State in case doc is fresh or loading
let tournamentData = {
  title: "Free Fire Daily Squad Championship",
  status: "upcoming",
  entryFee: 100,
  prizePool: 1000,
  matchCount: 3,
  matches: [
    { matchNumber: 1, map: "Bermuda", time: "08:00 PM", roomId: "893411", roomPass: "7788", status: "upcoming" },
    { matchNumber: 2, map: "Purgatory", time: "08:45 PM", roomId: "", roomPass: "", status: "upcoming" },
    { matchNumber: 3, map: "Kalahari", time: "09:30 PM", roomId: "", roomPass: "", status: "upcoming" }
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
  ]
};

// UI Elements
const $ = (id) => document.getElementById(id);

function showToast(msg) {
  const toastEl = $('liveToast');
  const msgEl = $('toastMessage');
  if (msgEl) msgEl.textContent = msg;
  if (toastEl && window.bootstrap) {
    const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
    toast.show();
  }
}

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.bottom-nav .nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  const target = $(tabId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Render Tournament Overview & Matches
function renderOverview() {
  const titleEl = $('tournamentTitleEl');
  if (titleEl) titleEl.textContent = tournamentData.title || "Free Fire Daily Squad Championship";
  
  const entryFeeEl = $('entryFeeEl');
  if (entryFeeEl) entryFeeEl.textContent = `৳${tournamentData.entryFee || 100}`;
  
  const prizePoolEl = $('prizePoolEl');
  if (prizePoolEl) prizePoolEl.textContent = `৳${tournamentData.prizePool || 1000}`;
  
  const matchCount = tournamentData.matchCount || (tournamentData.matches ? tournamentData.matches.length : 3);
  const seriesMatchEl = $('seriesMatchCountEl');
  if (seriesMatchEl) seriesMatchEl.textContent = `${matchCount} Matches`;
  
  const matchSummaryEl = $('matchSummaryCountEl');
  if (matchSummaryEl) matchSummaryEl.textContent = `${matchCount} Matches in Series`;

  // Status Badge
  const statusBadge = $('liveStatusBadge');
  if (statusBadge) {
    if (tournamentData.status === 'live') {
      statusBadge.className = 'pill-badge badge-live';
      statusBadge.innerHTML = '<i class="bi bi-broadcast"></i> LIVE NOW';
    } else if (tournamentData.status === 'completed') {
      statusBadge.className = 'pill-badge bg-secondary text-white';
      statusBadge.innerHTML = '<i class="bi bi-check-all"></i> COMPLETED';
    } else {
      statusBadge.className = 'pill-badge badge-upcoming';
      statusBadge.innerHTML = '<i class="bi bi-clock-fill"></i> UPCOMING';
    }
  }

  // Calculate booked slots
  const slots = tournamentData.slots || [];
  const bookedCount = slots.filter(s => s.booked).length;
  const progressText = $('slotProgressTextEl');
  if (progressText) progressText.textContent = `${bookedCount} / 12 Squads`;
  
  const progressFill = $('slotProgressFillEl');
  if (progressFill) {
    const pct = Math.round((bookedCount / 12) * 100);
    progressFill.style.width = `${pct}%`;
  }

  // Render Match Schedule
  const matches = (tournamentData.matches || []).slice(0, matchCount);
  const container = $('matchScheduleContainerEl');
  if (container) {
    container.innerHTML = matches.map((m, idx) => {
      const isLive = m.status === 'live';
      const isDone = m.status === 'completed';
      const statusHtml = isLive 
        ? '<span class="badge bg-danger">LIVE</span>' 
        : (isDone ? '<span class="badge bg-secondary">FINISHED</span>' : '<span class="badge bg-warning text-dark">UPCOMING</span>');
      
      return `
        <div class="match-item-card">
          <div>
            <div class="match-meta-title">
              <span class="text-warning fw-bold">Match ${m.matchNumber || (idx + 1)}:</span> ${m.map || 'Bermuda'}
            </div>
            <div class="match-meta-sub">
              <i class="bi bi-clock"></i> ${m.time || 'TBD'} • Squad Battle
            </div>
          </div>
          <div>
            ${statusHtml}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Render Slots Tab
function renderSlots() {
  const container = $('slotsListContainerEl');
  if (!container) return;

  const slots = tournamentData.slots || [];
  container.innerHTML = slots.map(slot => {
    if (slot.booked) {
      return `
        <div class="slot-card booked">
          <div class="d-flex align-items-center gap-3">
            <div class="slot-number-badge">${slot.slotNumber}</div>
            <div>
              <div class="fw-bold text-white">${slot.squadName || 'Squad ' + slot.slotNumber}</div>
              <div class="small text-secondary">
                Leader: <span class="text-warning">${slot.leaderIgn || 'N/A'}</span>
                ${slot.player2 ? `• ${slot.player2}` : ''}
              </div>
            </div>
          </div>
          <div>
            <span class="badge bg-success"><i class="bi bi-check2-circle"></i> BOOKED</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="slot-card empty">
          <div class="d-flex align-items-center gap-3">
            <div class="slot-number-badge">${slot.slotNumber}</div>
            <div>
              <div class="fw-bold text-secondary">Available Slot</div>
              <div class="small text-muted">Ready for squad registration</div>
            </div>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-warning select-book-slot-btn" data-slot="${slot.slotNumber}">
              Book Slot
            </button>
          </div>
        </div>
      `;
    }
  }).join('');

  // Wire inline book buttons
  container.querySelectorAll('.select-book-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openBookingModal(Number(btn.dataset.slot));
    });
  });
}

// Render Room Credentials
function renderRoomCredentials() {
  const container = $('roomCredentialsContainerEl');
  if (!container) return;

  const matchCount = tournamentData.matchCount || (tournamentData.matches ? tournamentData.matches.length : 3);
  const matches = (tournamentData.matches || []).slice(0, matchCount);

  container.innerHTML = matches.map((m, idx) => {
    const hasRoom = m.roomId && m.roomId.trim().length > 0;
    return `
      <div class="room-cred-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="fw-bold text-white fs-6">
            <i class="bi bi-crosshair text-warning me-1"></i> Match ${m.matchNumber || (idx + 1)} (${m.map || 'Bermuda'})
          </div>
          <span class="small text-secondary"><i class="bi bi-clock"></i> ${m.time || 'TBD'}</span>
        </div>

        ${hasRoom ? `
          <div class="row g-2">
            <div class="col-6">
              <div class="small text-secondary mb-1">Room ID</div>
              <div class="copy-chip w-100 justify-content-between copy-trigger" data-copy="${m.roomId}">
                <span>${m.roomId}</span>
                <i class="bi bi-clipboard"></i>
              </div>
            </div>
            <div class="col-6">
              <div class="small text-secondary mb-1">Password</div>
              <div class="copy-chip w-100 justify-content-between copy-trigger" data-copy="${m.roomPass}">
                <span>${m.roomPass || '1234'}</span>
                <i class="bi bi-clipboard"></i>
              </div>
            </div>
          </div>
        ` : `
          <div class="text-center py-2 text-secondary small bg-dark rounded border border-secondary border-opacity-50">
            <i class="bi bi-hourglass-split text-warning me-1"></i> Room ID & Pass will be released 15 mins before match.
          </div>
        `}
      </div>
    `;
  }).join('');

  // Wire copy triggers
  container.querySelectorAll('.copy-trigger').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.copy;
      if (val) {
        navigator.clipboard.writeText(val);
        showToast(`Copied: ${val}`);
      }
    });
  });
}

// Render Standings
function renderStandings() {
  const tbody = $('standingsTableBodyEl');
  if (!tbody) return;

  const standings = tournamentData.standings || [];
  if (!standings.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 text-secondary">
          No match results published yet. Check back during/after the matches!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = standings.map((item, idx) => `
    <tr>
      <td>
        <span class="fw-bold ${idx === 0 ? 'text-warning' : (idx === 1 ? 'text-info' : '')}">${idx + 1}.</span> 
        ${item.squadName}
      </td>
      <td>${item.matches || 1}</td>
      <td>${item.kills || 0}</td>
      <td class="fw-bold ${idx === 0 ? 'text-warning' : ''}">${item.pts || 0}</td>
    </tr>
  `).join('');
}

// Open Booking Modal with target slot
function openBookingModal(targetSlot = null) {
  const select = $('bookSlotNumberSelect');
  if (!select) return;

  select.innerHTML = '';
  const slots = tournamentData.slots || [];

  slots.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.slotNumber;
    opt.textContent = `Slot ${s.slotNumber} ${s.booked ? '(Already Booked - ' + s.squadName + ')' : '(Available)'}`;
    opt.disabled = s.booked && s.slotNumber !== targetSlot;
    if (targetSlot && s.slotNumber === targetSlot) {
      opt.selected = true;
    } else if (!targetSlot && !s.booked && !select.value) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  const alertEl = $('bookingAlertEl');
  if (alertEl) alertEl.style.display = 'none';

  if (window.bootstrap) {
    const modal = new bootstrap.Modal($('bookSlotModal'));
    modal.show();
  }
}

// Handle Form Submission for Slot Booking
async function handleBookSlotSubmit(e) {
  e.preventDefault();
  const slotNum = Number($('bookSlotNumberSelect').value);
  const squadName = $('bookSquadNameInput').value.trim();
  const leaderIgn = $('bookLeaderIgnInput').value.trim();
  const player2 = $('bookPlayer2Input').value.trim();
  const player3 = $('bookPlayer3Input').value.trim();
  const player4 = $('bookPlayer4Input').value.trim();
  const contact = $('bookContactInput').value.trim();

  const alertEl = $('bookingAlertEl');
  const btn = $('submitBookingBtn');

  if (!squadName || !leaderIgn || !contact) {
    if (alertEl) {
      alertEl.className = 'alert alert-warning small mt-2';
      alertEl.textContent = 'Please fill Squad Name, Leader IGN and Contact number.';
      alertEl.style.display = 'block';
    }
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Booking...';

  try {
    const currentSlots = [...(tournamentData.slots || [])];
    const slotIdx = currentSlots.findIndex(s => s.slotNumber === slotNum);

    if (slotIdx === -1) throw new Error("Invalid slot number.");

    currentSlots[slotIdx] = {
      slotNumber: slotNum,
      booked: true,
      squadName,
      leaderIgn,
      player2,
      player3,
      player4,
      contact
    };

    // Update in Firestore
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    await updateDoc(docRef, { slots: currentSlots });

    if (alertEl) {
      alertEl.className = 'alert alert-success small mt-2';
      alertEl.textContent = `Success! Slot ${slotNum} booked for ${squadName}.`;
      alertEl.style.display = 'block';
    }

    showToast(`Slot ${slotNum} Booked!`);
    setTimeout(() => {
      if (window.bootstrap) {
        bootstrap.Modal.getInstance($('bookSlotModal'))?.hide();
      }
      $('bookSlotForm').reset();
      switchTab('tab-slots');
    }, 1200);

  } catch (err) {
    console.error("Booking error:", err);
    if (alertEl) {
      alertEl.className = 'alert alert-danger small mt-2';
      alertEl.textContent = err.message || 'Failed to book slot. Try again.';
      alertEl.style.display = 'block';
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Confirm & Book Slot';
  }
}

// Setup Event Listeners
function setupEvents() {
  // Bottom navigation
  document.querySelectorAll('.bottom-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Action button triggers
  $('openBookSlotModalBtn')?.addEventListener('click', () => openBookingModal());
  $('slotTabBookBtn')?.addEventListener('click', () => openBookingModal());
  $('navToRoomBtn')?.addEventListener('click', () => switchTab('tab-room'));
  $('navToSlotsBtn')?.addEventListener('click', () => switchTab('tab-slots'));

  // Form submit
  $('bookSlotForm')?.addEventListener('submit', handleBookSlotSubmit);
}

// Real-Time Firestore Listener
function initRealtimeSync() {
  try {
    const docRef = doc(db, "tournaments", TOURNAMENT_DOC_ID);
    onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        tournamentData = { ...tournamentData, ...data };
        renderOverview();
        renderSlots();
        renderRoomCredentials();
        renderStandings();
      }
    }, (err) => {
      console.warn("Firestore onSnapshot error:", err);
    });
  } catch (e) {
    console.warn("initRealtimeSync failed to attach:", e);
  }
}

// Instant Initialization
function init() {
  setupEvents();
  renderOverview();
  renderSlots();
  renderRoomCredentials();
  renderStandings();
  initRealtimeSync();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
