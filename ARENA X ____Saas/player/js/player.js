// ==================================================
// SIFR TOURNAMENT BY SBS - Player Logic (Rewired for Legacy UI)
// ==================================================
import { supabase } from '../../lib/supabaseClient.js';
import { resolveTenant, getTenantId } from '../../lib/tenantResolver.js';

let tenant = null;
let currentUser = null; // { auth: supabaseUser, db: publicUserRow }
let currentTournamentToJoin = null;

// ---- HELPERS ----
const $ = (id) => document.getElementById(id);
const showLoader = (show) => { const el = $('globalLoaderEl'); if (el) el.style.display = show ? 'flex' : 'none'; };
const showStatus = (el, msg, type = 'danger') => { if (!el) return; el.className = `alert alert-${type} mt-3`; el.textContent = msg; el.style.display = 'block'; };
const hideStatus = (el) => { if (el) el.style.display = 'none'; };
const fmt = (n) => `৳${Number(n || 0).toFixed(2)}`;

// ---- SECTION NAVIGATION ----
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const target = $(sectionId);
    if (target) { target.classList.add('active'); target.style.display = 'block'; }
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
    });
    // Special: tournaments-section from game card click
    if (sectionId === 'tournaments-section') {
        const backBtn = $('headerBackBtnEl');
        const gameTitle = $('headerGameTitleEl');
        const titleContainer = $('headerTitleContainerEl');
        if (backBtn) backBtn.style.display = 'block';
        if (gameTitle) gameTitle.style.display = 'block';
        if (titleContainer) titleContainer.style.display = 'none';
    } else {
        const backBtn = $('headerBackBtnEl');
        const gameTitle = $('headerGameTitleEl');
        const titleContainer = $('headerTitleContainerEl');
        if (backBtn) backBtn.style.display = 'none';
        if (gameTitle) gameTitle.style.display = 'none';
        if (titleContainer) titleContainer.style.display = 'block';
    }
}

// ---- AUTH ----
async function handleLogin() {
    const email = $('loginEmailInputEl')?.value?.trim();
    const password = $('loginPasswordInputEl')?.value;
    if (!email || !password) return;
    const errEl = $('customLoginErrorEl');
    const statusEl = $('loginStatusMessageEl');
    if (errEl) { errEl.style.display = 'none'; }
    hideStatus(statusEl);
    showLoader(true);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Auth state change listener will handle the rest
    } catch (err) {
        if (errEl) { errEl.textContent = err.message || 'Login failed'; errEl.style.display = 'block'; }
    } finally { showLoader(false); }
}

async function handleSignup() {
    const email = $('signupEmailInputEl')?.value?.trim();
    const password = $('signupPasswordInputEl')?.value;
    const confirmPass = $('signupConfirmPasswordInputEl')?.value;
    const referralCode = $('signupReferralCodeInputEl')?.value?.trim();
    const statusEl = $('signupStatusMessageEl');
    hideStatus(statusEl);

    if (!email || !password) { showStatus(statusEl, 'Email and password required.', 'warning'); return; }
    if (password !== confirmPass) { showStatus(statusEl, 'Passwords do not match.', 'warning'); return; }
    if (password.length < 6) { showStatus(statusEl, 'Password must be at least 6 characters.', 'warning'); return; }

    showLoader(true);
    try {
        const tenantId = getTenantId();
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { tenant_id: tenantId, referred_by_code: referralCode || null } }
        });
        if (error) throw error;
        showStatus(statusEl, 'Account created! Please check your email or login.', 'success');
        // Switch to login form
        setTimeout(() => toggleAuthForm('login'), 2000);
    } catch (err) {
        showStatus(statusEl, err.message || 'Signup failed.', 'danger');
    } finally { showLoader(false); }
}

function toggleAuthForm(show) {
    const loginForm = $('emailLoginForm');
    const signupForm = $('emailSignupForm');
    if (show === 'signup') {
        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'block';
    } else {
        if (loginForm) loginForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
    }
}

async function handleLogout() {
    showLoader(true);
    await supabase.auth.signOut();
    currentUser = null;
    showLoader(false);
    showAuthUI();
}

function showAuthUI() {
    // Hide main content, show login
    document.querySelectorAll('.section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const loginSection = $('login-section');
    if (loginSection) { loginSection.classList.add('active'); loginSection.style.display = 'block'; }
    const walletChip = $('headerWalletChipEl');
    if (walletChip) walletChip.style.display = 'none';
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.display = 'none';
}

function showMainUI() {
    const loginSection = $('login-section');
    if (loginSection) { loginSection.classList.remove('active'); loginSection.style.display = 'none'; }
    const walletChip = $('headerWalletChipEl');
    if (walletChip) walletChip.style.display = 'flex';
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) bottomNav.style.display = 'flex';
    showSection('home-section');
}

// ---- DATA LOADING ----
async function loadUserProfile() {
    if (!currentUser) return;
    const u = currentUser.db;
    const el = (id, val) => { const e = $(id); if (e) e.textContent = val; };
    el('profileNameEl', u.username || 'Player');
    el('profileEmailEl', currentUser.auth.email || '');
    el('profileUidEl', u.user_app_id || u.id?.substring(0, 8) || '');
    const avatar = $('profileAvatarEl');
    if (avatar && u.photo_url) avatar.src = u.photo_url;
}

async function loadWallet() {
    if (!currentUser || !tenant) return;
    try {
        const { data: wallet, error } = await supabase
            .from('wallets').select('*')
            .eq('user_id', currentUser.auth.id).eq('tenant_id', tenant.id).single();
        if (error) throw error;
        const total = Number(wallet.main_balance) + Number(wallet.winning_cash) + Number(wallet.bonus_cash);
        const el = (id, val) => { const e = $(id); if (e) e.textContent = val; };
        el('headerChipBalanceEl', total.toFixed(0));
        el('walletTotalBalanceEl', fmt(total));
        el('walletWinningCashEl', fmt(wallet.winning_cash));
        el('walletBonusCashEl', fmt(wallet.bonus_cash));
        el('withdrawModalBalanceEl', fmt(wallet.winning_cash));
    } catch (err) { console.error('Wallet load error:', err); }
}

async function loadTransactions() {
    if (!currentUser || !tenant) return;
    const container = $('recentTransactionsListEl');
    if (!container) return;
    try {
        const { data, error } = await supabase
            .from('wallet_ledger').select('amount, action_type, source, created_at')
            .eq('user_id', currentUser.auth.id).eq('tenant_id', tenant.id)
            .order('created_at', { ascending: false }).limit(15);
        if (error) throw error;
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-secondary text-center mt-3">No transactions yet.</p>';
            return;
        }
        container.innerHTML = data.map(tx => {
            const isAdd = tx.action_type === 'addition';
            const color = isAdd ? 'text-success' : 'text-danger';
            const sign = isAdd ? '+' : '-';
            const icon = isAdd ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill';
            const source = (tx.source || '').replace(/_/g, ' ').toUpperCase();
            const date = new Date(tx.created_at).toLocaleDateString();
            return `<div class="custom-card p-2 mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi ${icon} ${color}"></i>
                        <div><small class="fw-bold">${source}</small><br><small class="text-secondary">${date}</small></div>
                    </div>
                    <span class="${color} fw-bold">${sign}${fmt(Math.abs(tx.amount))}</span>
                </div>
            </div>`;
        }).join('');
    } catch (err) { console.error('Transactions error:', err); }
}

async function loadTournaments(filter = 'Solo') {
    if (!tenant) return;
    const container = $('tournamentsListContainerEl');
    if (!container) return;
    try {
        let query = supabase.from('tournaments').select('*').eq('tenant_id', tenant.id);
        if (filter === 'Completed') {
            query = query.eq('status', 'completed');
        } else {
            query = query.eq('match_type', filter).in('status', ['upcoming', 'active']);
        }
        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        const noMsg = $('noTournamentsMessageEl');
        if (!data || data.length === 0) {
            container.innerHTML = '';
            if (noMsg) { noMsg.textContent = 'No tournaments found.'; noMsg.style.display = 'block'; }
            return;
        }
        if (noMsg) noMsg.style.display = 'none';
        container.innerHTML = data.map(t => {
            const perc = t.max_slots > 0 ? Math.round((t.filled_slots / t.max_slots) * 100) : 0;
            const isFull = t.filled_slots >= t.max_slots;
            const joinBtn = isFull
                ? `<button class="btn btn-sm btn-disabled" disabled>FULL</button>`
                : `<button class="btn btn-sm btn-join" data-join-id="${t.id}" data-join-fee="${t.entry_fee}" data-join-title="${t.title}" data-join-type="${t.match_type}">JOIN ৳${t.entry_fee}</button>`;
            const tags = t.match_type ? `<span>${t.match_type}</span>` : '';
            return `<div class="tournament-card">
                <div class="tournament-card-header"><div class="tournament-card-tags">${tags}</div></div>
                <div class="tournament-card-title"><i class="bi bi-trophy-fill"></i>${t.title}</div>
                <div class="tournament-card-info">
                    <div class="info-item"><span>Entry</span><strong>${fmt(t.entry_fee)}</strong></div>
                    <div class="info-item"><span>Prize</span><strong class="text-accent">${fmt(t.prize_pool)}</strong></div>
                    <div class="info-item"><span>Per Kill</span><strong>${fmt(t.per_kill)}</strong></div>
                    <div class="info-item"><span>Type</span><strong>${t.match_type}</strong></div>
                </div>
                <div class="tournament-card-spots">Spots: <span>${t.filled_slots}/${t.max_slots}</span>
                    <div class="progress mt-1"><div class="progress-bar" style="width:${perc}%"></div></div>
                </div>
                <div class="tournament-card-actions">
                    <button class="btn btn-sm btn-details" data-details-id="${t.id}">Details</button>
                    ${joinBtn}
                </div>
            </div>`;
        }).join('');
    } catch (err) { console.error('Tournaments error:', err); container.innerHTML = '<p class="text-danger text-center">Error loading tournaments.</p>'; }
}

async function loadGames() {
    if (!tenant) return;
    const container = $('gamesListEl');
    if (!container) return;
    // For now, show a single "All Tournaments" card since games are managed by admin
    container.innerHTML = `<div class="col-6"><div class="game-card custom-card" data-game-click="true">
        <div style="height:130px;background:linear-gradient(145deg,var(--secondary-bg),var(--primary-bg));display:flex;align-items:center;justify-content:center;">
            <i class="bi bi-controller" style="font-size:3rem;color:var(--accent-color);"></i>
        </div>
        <span>All Tournaments</span>
    </div></div>`;
}

async function loadMyContests() {
    if (!currentUser || !tenant) return;
    const container = $('myContestsListEl');
    const noMsg = $('noContestsMessageEl');
    if (!container) return;
    try {
        const { data, error } = await supabase
            .from('tournament_participants').select('tournament_id, tournaments(*)')
            .eq('user_id', currentUser.auth.id).eq('tenant_id', tenant.id)
            .order('joined_at', { ascending: false }).limit(5);
        if (error) throw error;
        if (!data || data.length === 0) {
            container.innerHTML = '';
            if (noMsg) { noMsg.textContent = "You haven't joined any contests yet."; noMsg.style.display = 'block'; }
            return;
        }
        if (noMsg) noMsg.style.display = 'none';
        container.innerHTML = data.map(p => {
            const t = p.tournaments;
            if (!t) return '';
            const statusClass = t.status === 'upcoming' ? 'text-bg-info' : t.status === 'active' ? 'text-bg-success' : 'text-bg-secondary';
            return `<div class="tournament-card mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>${t.title}</strong>
                    <span class="badge ${statusClass}">${t.status}</span>
                </div>
                <small class="text-secondary">${t.match_type} | Prize: ${fmt(t.prize_pool)}</small>
                <div class="tournament-card-actions mt-2">
                    <button class="btn btn-sm btn-details" data-details-id="${t.id}">Details</button>
                    <button class="btn btn-sm btn-joined" disabled>✓ Joined</button>
                </div>
            </div>`;
        }).join('');
    } catch (err) { console.error('My contests error:', err); }
}

async function loadReferralData() {
    if (!currentUser || !tenant) return;
    const codeEl = $('myReferralCodeEl');
    if (codeEl) codeEl.textContent = currentUser.db.referral_code || 'N/A';
    try {
        const { data, error } = await supabase
            .from('referral_commissions').select('amount')
            .eq('referrer_id', currentUser.auth.id).eq('tenant_id', tenant.id);
        if (!error && data) {
            const total = data.reduce((sum, r) => sum + Number(r.amount), 0);
            const el = $('totalReferralEarningsEl');
            if (el) el.textContent = total.toFixed(2);
        }
        // Referred count
        const { count } = await supabase
            .from('users').select('*', { count: 'exact', head: true })
            .eq('referred_by', currentUser.auth.id).eq('tenant_id', tenant.id);
        const countEl = $('totalReferredCountEl');
        if (countEl) countEl.textContent = count || 0;
    } catch (err) { console.error('Referral error:', err); }
}

// ---- JOIN TOURNAMENT ----
function openJoinModal(tournamentId, title, fee, type) {
    currentTournamentToJoin = { id: tournamentId, title, fee, type };
    const nameInput = $('inGameNameInputEl');
    if (nameInput) nameInput.value = '';
    hideStatus($('inGameNameStatusMessageEl'));
    const modal = new bootstrap.Modal($('inGameNameModalEl'));
    modal.show();
}

async function handleJoinTournament() {
    if (!currentTournamentToJoin || !currentUser || !tenant) return;
    const ign = $('inGameNameInputEl')?.value?.trim();
    const statusEl = $('inGameNameStatusMessageEl');
    if (!ign) { showStatus(statusEl, 'Please enter your in-game name.', 'warning'); return; }
    const btn = $('confirmJoinBtnEl');
    if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }
    try {
        const { data, error } = await supabase.rpc('join_tournament', {
            p_tournament_id: currentTournamentToJoin.id,
            p_tenant_id: tenant.id,
            p_user_id: currentUser.auth.id,
            p_team_data: JSON.stringify({ players: [ign] })
        });
        if (error) {
            if (error.message.includes('Insufficient')) showStatus(statusEl, 'Insufficient balance. Please deposit first.', 'danger');
            else if (error.message.includes('full')) showStatus(statusEl, 'Tournament is full!', 'danger');
            else showStatus(statusEl, error.message, 'danger');
            return;
        }
        showStatus(statusEl, 'Successfully joined!', 'success');
        bootstrap.Modal.getInstance($('inGameNameModalEl'))?.hide();
        await loadWallet();
        await loadTournaments();
        await loadMyContests();
    } catch (err) { showStatus(statusEl, err.message, 'danger'); }
    finally { if (btn) { btn.disabled = false; btn.textContent = 'Confirm & Join'; } }
}

// ---- DEPOSIT ----
async function handleDeposit() {
    const amount = Number($('depositAmountInputEl')?.value);
    if (!amount || amount < 10) { alert('Minimum deposit is ৳10'); return; }
    // Show step 2
    const step1 = $('depositStep1');
    const step2 = $('depositStep2');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    // Store amount for verification
    window._pendingDepositAmount = amount;
}

async function handleVerifyDeposit() {
    const trxId = $('transactionIdInputEl')?.value?.trim();
    const statusEl = $('depositStatusMessageEl');
    const amount = window._pendingDepositAmount;
    if (!trxId) { showStatus(statusEl, 'Please enter the transaction ID.', 'warning'); return; }
    showLoader(true);
    try {
        const { error } = await supabase.from('transactions').insert([{
            tenant_id: tenant.id, user_id: currentUser.auth.id,
            type: 'deposit', amount: amount, trx_id: trxId, status: 'pending',
            notes: 'Deposit request via app'
        }]);
        if (error) throw error;
        showStatus(statusEl, 'Deposit request submitted! Admin will verify shortly.', 'success');
        setTimeout(() => { bootstrap.Modal.getInstance($('addAmountModalEl'))?.hide(); }, 2000);
    } catch (err) { showStatus(statusEl, err.message, 'danger'); }
    finally { showLoader(false); }
}

// ---- WITHDRAW ----
async function handleWithdraw() {
    const amount = Number($('withdrawAmountInputEl')?.value);
    const method = $('withdrawMethodSelectEl')?.value;
    const number = $('withdrawNumberInputEl')?.value?.trim();
    const statusEl = $('withdrawStatusMessageEl');
    if (!amount || amount < 50) { showStatus(statusEl, 'Minimum withdrawal is ৳50.', 'warning'); return; }
    if (!number || number.length !== 11) { showStatus(statusEl, 'Enter a valid 11-digit number.', 'warning'); return; }
    showLoader(true);
    try {
        const { error } = await supabase.from('transactions').insert([{
            tenant_id: tenant.id, user_id: currentUser.auth.id,
            type: 'withdrawal', amount: amount, status: 'pending',
            notes: `${method} - ${number}`
        }]);
        if (error) throw error;
        bootstrap.Modal.getInstance($('withdrawModalEl'))?.hide();
        // Show success overlay
        const overlay = $('success-overlay');
        if (overlay) { overlay.classList.add('visible'); setTimeout(() => overlay.classList.remove('visible'), 3000); }
    } catch (err) { showStatus(statusEl, err.message, 'danger'); }
    finally { showLoader(false); }
}

// ---- TENANT BRANDING ----
function applyBranding() {
    if (!tenant) return;
    const logo = $('appLogoEl');
    if (logo && tenant.settings?.logo_url) logo.src = tenant.settings.logo_url;
    const title = $('headerTitleContainerEl');
    if (title && tenant.name) title.textContent = tenant.name;
    if (tenant.settings?.primary_color) {
        document.documentElement.style.setProperty('--accent-color', tenant.settings.primary_color);
    }
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Bind UI events FIRST (always works regardless of data)
    // Bottom nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.addEventListener('click', () => showSection(item.getAttribute('data-section')));
    });
    // Back button
    $('headerBackBtnEl')?.addEventListener('click', () => showSection('home-section'));
    // Auth buttons
    $('loginEmailBtnEl')?.addEventListener('click', handleLogin);
    $('signupEmailBtnEl')?.addEventListener('click', handleSignup);
    $('showSignupToggleBtnEl')?.addEventListener('click', () => toggleAuthForm('signup'));
    $('showLoginToggleBtnEl')?.addEventListener('click', () => toggleAuthForm('login'));
    $('logoutProfileBtnEl')?.addEventListener('click', handleLogout);
    // Enter key on login
    $('loginPasswordInputEl')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleLogin(); } });
    // Wallet chip -> wallet section
    $('headerWalletChipEl')?.addEventListener('click', () => showSection('wallet-section'));
    // Join tournament
    $('confirmJoinBtnEl')?.addEventListener('click', handleJoinTournament);
    // Deposit
    $('confirmDepositBtnEl')?.addEventListener('click', handleDeposit);
    $('verifyTransactionBtnEl')?.addEventListener('click', handleVerifyDeposit);
    $('addAmountWalletBtnEl')?.addEventListener('click', () => {
        const step1 = $('depositStep1'); const step2 = $('depositStep2');
        if (step1) step1.style.display = 'block'; if (step2) step2.style.display = 'none';
        hideStatus($('depositStatusMessageEl'));
        new bootstrap.Modal($('addAmountModalEl')).show();
    });
    // Withdraw
    $('withdrawBtnEl')?.addEventListener('click', () => new bootstrap.Modal($('withdrawModalEl')).show());
    $('submitWithdrawRequestBtnEl')?.addEventListener('click', handleWithdraw);
    // Referral
    $('openReferralBtnEl')?.addEventListener('click', () => { loadReferralData(); new bootstrap.Modal($('referralModalEl')).show(); });
    $('shareReferralLinkBtn')?.addEventListener('click', () => {
        const code = currentUser?.db?.referral_code;
        if (code && navigator.share) { navigator.share({ title: 'Join my team!', text: `Use my referral code: ${code}` }); }
        else if (code) { navigator.clipboard?.writeText(code); alert('Code copied!'); }
    });
    // Game card click -> tournaments
    document.addEventListener('click', (e) => {
        const gameCard = e.target.closest('[data-game-click]');
        if (gameCard) { showSection('tournaments-section'); loadTournaments('Solo'); }
        // Join button in tournament card
        const joinBtn = e.target.closest('[data-join-id]');
        if (joinBtn) { openJoinModal(joinBtn.dataset.joinId, joinBtn.dataset.joinTitle, joinBtn.dataset.joinFee, joinBtn.dataset.joinType); }
    });
    // Tournament filter tabs
    document.querySelectorAll('.tab-item[data-filter]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item[data-filter]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadTournaments(tab.dataset.filter);
        });
    });
    // Copy buttons
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn[data-target]');
        if (copyBtn) {
            const targetEl = document.querySelector(copyBtn.dataset.target);
            if (targetEl) { navigator.clipboard?.writeText(targetEl.textContent.trim()); }
        }
    });

    // 2. Resolve Tenant
    showLoader(true);
    try {
        tenant = await resolveTenant();
        if (!tenant) { showAuthUI(); showLoader(false); return; }
        applyBranding();
    } catch (err) { console.error('Tenant error:', err); }

    // 3. Auth State Listener
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            try {
                const { data: userData, error } = await supabase
                    .from('users').select('*').eq('id', session.user.id).single();
                if (error || !userData) { await supabase.auth.signOut(); showAuthUI(); return; }
                currentUser = { auth: session.user, db: userData };
                showMainUI();
                loadUserProfile();
                loadWallet();
                loadGames();
                loadMyContests();
                loadTransactions();
            } catch (err) { console.error('User load error:', err); showAuthUI(); }
        } else {
            currentUser = null;
            showAuthUI();
        }
        showLoader(false);
    });
});
