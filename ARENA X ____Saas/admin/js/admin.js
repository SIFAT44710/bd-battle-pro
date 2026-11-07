import { supabase } from '../../lib/supabaseClient.js';
import { resolveTenant, getTenantId } from '../../lib/tenantResolver.js';

let tenant = null;
let currentUser = null;
const $ = (id) => document.getElementById(id);
const fmt = (n) => `৳${Number(n||0).toFixed(2)}`;

// --- SECTION NAV ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const t = $(id); if (t) { t.classList.add('active'); t.style.display = 'block'; }
    document.querySelectorAll('#adminSidebar .nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === id));
    const title = $('adminPageTitle');
    if (title) title.textContent = id.replace('-section','').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    const offcanvas = bootstrap.Offcanvas.getInstance($('adminSidebar'));
    if (offcanvas) offcanvas.hide();
}

// --- AUTH ---
async function handleAdminLogin(e) {
    e.preventDefault();
    const email = $('adminEmail')?.value?.trim();
    const pass = $('adminPassword')?.value;
    const st = $('adminLoginStatus');
    if (!email||!pass) { if(st) st.innerHTML='<div class="alert alert-warning">Fill all fields</div>'; return; }
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
    } catch(err) { if(st) st.innerHTML=`<div class="alert alert-danger">${err.message}</div>`; }
}

async function handleAdminSetup(e) {
    e.preventDefault();
    const email = $('setupEmail')?.value?.trim();
    const pass = $('setupPassword')?.value;
    const st = $('adminSetupStatus');
    if (!email||!pass||pass.length<6) { if(st) st.innerHTML='<div class="alert alert-warning">Valid email & 6+ char password required</div>'; return; }
    try {
        const tid = getTenantId();
        const { error } = await supabase.auth.signUp({ email, password: pass, options: { data: { tenant_id: tid, role: 'admin' } } });
        if (error) throw error;
        if(st) st.innerHTML='<div class="alert alert-success">Admin created! Please login.</div>';
        setTimeout(() => { $('admin-setup-section').style.display='none'; $('admin-login-section').style.display='block'; }, 1500);
    } catch(err) { if(st) st.innerHTML=`<div class="alert alert-danger">${err.message}</div>`; }
}

function showAuth() {
    $('auth-container').style.display='block'; $('admin-main-area').style.display='none';
    $('admin-login-section').style.display='block'; $('admin-setup-section').style.display='none';
    const loader=$('adminLoader'); if(loader) loader.style.display='none';
}
function showMain() {
    $('auth-container').style.display='none'; $('admin-main-area').style.display='block';
    const loader=$('adminLoader'); if(loader) loader.style.display='none';
    if(currentUser) { const el=$('adminUserEmailShort'); if(el) el.textContent=currentUser.auth.email; }
    showSection('dashboard-section');
    loadDashboard(); loadUsers(); loadTournaments(); loadGames(); loadWithdrawals(); loadDeposits();
}

// --- DASHBOARD ---
async function loadDashboard() {
    if(!tenant) return;
    const tid = tenant.id;
    try {
        const [{count:uc},{count:at},{count:pw},{count:cw},{count:rw},{count:gc},{count:ft},{count:tp}] = await Promise.all([
            supabase.from('users').select('*',{count:'exact',head:true}).eq('tenant_id',tid),
            supabase.from('tournaments').select('*',{count:'exact',head:true}).eq('tenant_id',tid).in('status',['upcoming','active']),
            supabase.from('transactions').select('*',{count:'exact',head:true}).eq('tenant_id',tid).eq('type','withdrawal').eq('status','pending'),
            supabase.from('transactions').select('*',{count:'exact',head:true}).eq('tenant_id',tid).eq('type','withdrawal').eq('status','completed'),
            supabase.from('transactions').select('*',{count:'exact',head:true}).eq('tenant_id',tid).eq('type','withdrawal').eq('status','rejected'),
            supabase.from('games').select('*',{count:'exact',head:true}).eq('tenant_id',tid),
            supabase.from('tournaments').select('*',{count:'exact',head:true}).eq('tenant_id',tid).eq('status','completed'),
            supabase.from('promotions').select('*',{count:'exact',head:true}).eq('tenant_id',tid),
        ]);
        const s=(id,v)=>{const e=$(id);if(e)e.textContent=v||0;};
        s('statTotalUsers',uc);s('statActiveTournaments',at);s('statPendingWithdrawals',pw);
        s('statCompletedWithdrawals',cw);s('statRejectedWithdrawals',rw);s('statTotalGames',gc);
        s('statFinishedTournaments',ft);s('statTotalPromotions',tp);
        const badge=$('pendingWithdrawalCountBadge');
        if(badge&&pw>0){badge.textContent=pw;badge.style.display='inline';}
    } catch(err) { console.error('Dashboard error:',err); }
}

// --- USERS ---
async function loadUsers() {
    if(!tenant) return;
    const tbody=$('usersTableBody'); if(!tbody) return;
    try {
        const {data:users,error}=await supabase.from('users').select('*, wallets(main_balance,winning_cash,bonus_cash)').eq('tenant_id',tenant.id).order('created_at',{ascending:false});
        if(error) throw error;
        if(!users||!users.length){tbody.innerHTML='<tr><td colspan="6" class="text-center p-3">No users found.</td></tr>';return;}
        tbody.innerHTML=users.map(u=>{
            const w=u.wallets?.[0]||{}; const bal=Number(w.main_balance||0)+Number(w.winning_cash||0)+Number(w.bonus_cash||0);
            const statusBadge=u.status==='blocked'?'<span class="badge bg-danger">Blocked</span>':'<span class="badge bg-success">Active</span>';
            return `<tr><td><small class="text-muted">${(u.user_app_id||u.id).substring(0,8)}</small></td>
            <td>${u.username||'N/A'}</td><td>${u.email||'N/A'}</td><td>${fmt(bal)}</td><td>${statusBadge}</td>
            <td><button class="btn btn-sm btn-outline-info view-user-btn" data-uid="${u.id}"><i class="bi bi-eye"></i></button></td></tr>`;
        }).join('');
    } catch(err){console.error('Users error:',err);}
}

// --- TOURNAMENTS ---
async function loadTournaments() {
    if(!tenant) return;
    const tbody=$('tournamentsTableBody'); if(!tbody) return;
    try {
        const {data,error}=await supabase.from('tournaments').select('*').eq('tenant_id',tenant.id).order('created_at',{ascending:false});
        if(error) throw error;
        if(!data||!data.length){tbody.innerHTML='<tr><td colspan="8" class="text-center p-3">No tournaments.</td></tr>';return;}
        tbody.innerHTML=data.map(t=>{
            const statusClass=t.status==='active'?'bg-success':t.status==='upcoming'?'bg-info':t.status==='completed'?'bg-secondary':'bg-dark';
            return `<tr><td>${t.title}</td><td>${t.game_name||'N/A'}</td><td>${fmt(t.entry_fee)}</td><td>${fmt(t.prize_pool)}</td>
            <td>${t.start_time?new Date(t.start_time).toLocaleString():'N/A'}</td>
            <td><span class="badge ${statusClass}">${t.status||t.match_type}</span></td>
            <td>${t.filled_slots||0}/${t.max_slots||0}</td>
            <td><button class="btn btn-sm btn-outline-warning edit-tournament-btn" data-tid="${t.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-info view-players-btn" data-tid="${t.id}" data-tname="${t.title}"><i class="bi bi-people"></i></button>
            <button class="btn btn-sm btn-outline-danger delete-tournament-btn" data-tid="${t.id}"><i class="bi bi-trash"></i></button></td></tr>`;
        }).join('');
    } catch(err){console.error('Tournaments error:',err);}
}

async function saveTournament() {
    const tid=tenant?.id; if(!tid) return;
    const editId=$('tournamentEditId')?.value;
    const obj={tenant_id:tid, title:$('tournamentName')?.value, game_name:$('tournamentGame')?.value,
        match_type:$('tournamentStatus')?.value, entry_fee:Number($('tournamentEntryFee')?.value||0),
        prize_pool:Number($('tournamentPrizePool')?.value||0), per_kill:Number($('tournamentPerKill')?.value||0),
        max_slots:Number($('tournamentMaxPlayers')?.value||48),
        start_time:$('tournamentStartTime')?.value||null,
        room_id:$('tournamentRoomId')?.value||null, room_password:$('tournamentRoomPassword')?.value||null,
        show_id_pass:$('tournamentShowIdPass')?.checked||false,
        description:$('tournamentDescription')?.value||'',
        status: ['Solo','Duo','Squad'].includes($('tournamentStatus')?.value)?'upcoming':$('tournamentStatus')?.value?.toLowerCase()
    };
    const st=$('addTournamentStatus');
    try {
        if(editId){await supabase.from('tournaments').update(obj).eq('id',editId);}
        else{await supabase.from('tournaments').insert([obj]);}
        if(st) st.innerHTML='<div class="alert alert-success">Saved!</div>';
        bootstrap.Modal.getInstance($('addTournamentModal'))?.hide();
        loadTournaments(); loadDashboard();
    } catch(err){if(st) st.innerHTML=`<div class="alert alert-danger">${err.message}</div>`;}
}

// --- GAMES ---
async function loadGames() {
    if(!tenant) return;
    const tbody=$('gamesTableBody'); if(!tbody) return;
    try {
        const {data,error}=await supabase.from('games').select('*').eq('tenant_id',tenant.id);
        if(error) throw error;
        if(!data||!data.length){tbody.innerHTML='<tr><td colspan="4" class="text-center p-3">No games.</td></tr>';return;}
        tbody.innerHTML=data.map(g=>`<tr><td><img src="${g.image_url||''}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;"></td>
        <td>${g.name}</td><td><small>${g.id.substring(0,8)}</small></td>
        <td><button class="btn btn-sm btn-outline-warning edit-game-btn" data-gid="${g.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger delete-game-btn" data-gid="${g.id}"><i class="bi bi-trash"></i></button></td></tr>`).join('');
        // Populate tournament game dropdown
        const sel=$('tournamentGame');
        if(sel){sel.innerHTML=data.map(g=>`<option value="${g.name}">${g.name}</option>`).join('');}
    } catch(err){console.error('Games error:',err);}
}

async function saveGame() {
    const editId=$('gameEditId')?.value;
    const obj={tenant_id:tenant.id, name:$('gameName')?.value, image_url:$('gameImageUrl')?.value};
    try {
        if(editId){await supabase.from('games').update(obj).eq('id',editId);}
        else{await supabase.from('games').insert([obj]);}
        bootstrap.Modal.getInstance($('gameModal'))?.hide();
        loadGames(); loadDashboard();
    } catch(err){const st=$('gameStatus');if(st) st.innerHTML=`<div class="alert alert-danger">${err.message}</div>`;}
}

// --- WITHDRAWALS ---
async function loadWithdrawals() {
    if(!tenant) return;
    for(const status of ['pending','completed','rejected']){
        const tbody=$(`${status}WithdrawalsTableBody`); if(!tbody) continue;
        try {
            const {data}=await supabase.from('transactions').select('*, users(username,email)')
                .eq('tenant_id',tenant.id).eq('type','withdrawal').eq('status',status).order('created_at',{ascending:false});
            if(!data||!data.length){tbody.innerHTML=`<tr><td colspan="6" class="text-center p-3">No ${status} withdrawals.</td></tr>`;continue;}
            tbody.innerHTML=data.map(w=>{
                const user=w.users?.username||w.users?.email||'Unknown';
                const date=new Date(w.created_at).toLocaleString();
                const notes=w.notes||'';
                if(status==='pending'){
                    return `<tr><td>${date}</td><td>${user}</td><td>${fmt(w.amount)}</td><td>${notes}</td>
                    <td><button class="btn btn-sm btn-success approve-withdrawal-btn" data-wid="${w.id}" data-wuser="${user}" data-wamt="${w.amount}" data-wmethod="${notes}">Approve</button>
                    <button class="btn btn-sm btn-danger reject-withdrawal-btn" data-wid="${w.id}" data-wuser="${user}" data-wamt="${w.amount}" data-wmethod="${notes}">Reject</button></td></tr>`;
                }
                return `<tr><td>${date}</td><td>${w.updated_at?new Date(w.updated_at).toLocaleString():'N/A'}</td><td>${user}</td><td>${fmt(w.amount)}</td><td>${notes}</td><td>${w.admin_note||w.reject_reason||''}</td></tr>`;
            }).join('');
        } catch(err){console.error(`Withdrawals ${status} error:`,err);}
    }
}

// --- DEPOSITS ---
async function loadDeposits() {
    if(!tenant) return;
    for(const status of ['pending','completed','rejected']){
        const tbody=$(`${status}DepositsTableBody`); if(!tbody) continue;
        try {
            const {data}=await supabase.from('transactions').select('*, users(username,email)')
                .eq('tenant_id',tenant.id).eq('type','deposit').eq('status',status).order('created_at',{ascending:false});
            if(!data||!data.length){tbody.innerHTML=`<tr><td colspan="5" class="text-center p-3">No ${status} deposits.</td></tr>`;continue;}
            tbody.innerHTML=data.map(d=>{
                const user=d.users?.username||d.users?.email||'Unknown';
                const date=new Date(d.created_at).toLocaleString();
                if(status==='pending'){
                    return `<tr><td>${date}</td><td>${user}</td><td>${fmt(d.amount)}</td><td>${d.trx_id||'N/A'}</td>
                    <td><button class="btn btn-sm btn-success approve-deposit-btn" data-did="${d.id}" data-duid="${d.user_id}" data-damt="${d.amount}">Approve</button>
                    <button class="btn btn-sm btn-danger reject-deposit-btn" data-did="${d.id}">Reject</button></td></tr>`;
                }
                return `<tr><td>${date}</td><td>${user}</td><td>${fmt(d.amount)}</td><td>${d.trx_id||'N/A'}</td><td>${d.admin_note||d.reject_reason||''}</td></tr>`;
            }).join('');
        } catch(err){console.error(`Deposits ${status} error:`,err);}
    }
    // Badge
    const {count}=await supabase.from('transactions').select('*',{count:'exact',head:true}).eq('tenant_id',tenant.id).eq('type','deposit').eq('status','pending');
    const badge=$('pendingDepositCountBadge');
    if(badge&&count>0){badge.textContent=count;badge.style.display='inline';}
}

async function approveDeposit(txId, userId, amount) {
    try {
        const {error}=await supabase.rpc('approve_deposit',{p_transaction_id:txId,p_tenant_id:tenant.id,p_user_id:userId,p_amount:Number(amount)});
        if(error) throw error;
        alert('Deposit approved!'); loadDeposits(); loadDashboard();
    } catch(err){alert('Error: '+err.message);}
}

// --- SETTINGS ---
async function loadSettings() {
    if(!tenant) return;
    try {
        const {data}=await supabase.from('tenant_settings').select('*').eq('tenant_id',tenant.id).single();
        if(!data) return;
        const s=(id,v)=>{const e=$(id);if(e)e.value=v||'';};
        s('settingAppName',data.app_name);s('settingLogoUrl',data.logo_url);s('settingMinWithdraw',data.min_withdraw);
        s('settingReferralBonus',data.referral_bonus);s('settingSupportContact',data.support_contact);
        s('settingPaymentGatewayUrl',data.payment_gateway_url);
        s('settingTeleGroup',data.telegram_group);s('settingTeleID',data.telegram_id);s('settingFbPage',data.facebook_page);
        s('settingPolicyPrivacy',data.policy_privacy);s('settingPolicyTerms',data.policy_terms);
        s('settingPolicyRefund',data.policy_refund);s('settingPolicyFairPlay',data.policy_fair_play);
    } catch(err){console.error('Settings error:',err);}
}

async function saveSettings(e) {
    e.preventDefault();
    const st=$('settingsStatus');
    const obj={
        tenant_id:tenant.id, app_name:$('settingAppName')?.value, logo_url:$('settingLogoUrl')?.value,
        min_withdraw:Number($('settingMinWithdraw')?.value||50), referral_bonus:Number($('settingReferralBonus')?.value||0),
        support_contact:$('settingSupportContact')?.value, payment_gateway_url:$('settingPaymentGatewayUrl')?.value,
        telegram_group:$('settingTeleGroup')?.value, telegram_id:$('settingTeleID')?.value, facebook_page:$('settingFbPage')?.value,
        policy_privacy:$('settingPolicyPrivacy')?.value, policy_terms:$('settingPolicyTerms')?.value,
        policy_refund:$('settingPolicyRefund')?.value, policy_fair_play:$('settingPolicyFairPlay')?.value,
    };
    try {
        const {error}=await supabase.from('tenant_settings').upsert(obj,{onConflict:'tenant_id'});
        if(error) throw error;
        if(st) st.innerHTML='<div class="alert alert-success">Settings saved!</div>';
    } catch(err){if(st) st.innerHTML=`<div class="alert alert-danger">${err.message}</div>`;}
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    // Sidebar nav
    document.querySelectorAll('#adminSidebar .nav-link[data-section]').forEach(l => {
        l.addEventListener('click', (e) => { e.preventDefault(); showSection(l.dataset.section); });
    });
    // Auth forms
    $('adminLoginForm')?.addEventListener('submit', handleAdminLogin);
    $('adminSetupForm')?.addEventListener('submit', handleAdminSetup);
    $('adminLogoutBtnHeader')?.addEventListener('click', async()=>{ await supabase.auth.signOut(); showAuth(); });
    // Save buttons
    $('saveTournamentBtn')?.addEventListener('click', saveTournament);
    $('saveGameBtn')?.addEventListener('click', saveGame);
    $('appSettingsForm')?.addEventListener('submit', saveSettings);
    // Delegated events
    document.addEventListener('click', async(e) => {
        const viewUser=e.target.closest('.view-user-btn');
        if(viewUser){/* TODO: open user modal with details */}
        const delTournament=e.target.closest('.delete-tournament-btn');
        if(delTournament){if(confirm('Delete this tournament?')){await supabase.from('tournaments').delete().eq('id',delTournament.dataset.tid);loadTournaments();loadDashboard();}}
        const delGame=e.target.closest('.delete-game-btn');
        if(delGame){if(confirm('Delete this game?')){await supabase.from('games').delete().eq('id',delGame.dataset.gid);loadGames();loadDashboard();}}
        const approveDep=e.target.closest('.approve-deposit-btn');
        if(approveDep){approveDeposit(approveDep.dataset.did,approveDep.dataset.duid,approveDep.dataset.damt);}
        const rejectDep=e.target.closest('.reject-deposit-btn');
        if(rejectDep){if(confirm('Reject this deposit?')){await supabase.from('transactions').update({status:'rejected'}).eq('id',rejectDep.dataset.did);loadDeposits();}}
        const approveW=e.target.closest('.approve-withdrawal-btn');
        if(approveW){if(confirm('Approve this withdrawal?')){await supabase.from('transactions').update({status:'completed'}).eq('id',approveW.dataset.wid);loadWithdrawals();loadDashboard();}}
        const rejectW=e.target.closest('.reject-withdrawal-btn');
        if(rejectW){if(confirm('Reject this withdrawal?')){await supabase.from('transactions').update({status:'rejected'}).eq('id',rejectW.dataset.wid);loadWithdrawals();loadDashboard();}}
        const viewPlayers=e.target.closest('.view-players-btn');
        if(viewPlayers){loadRegisteredPlayers(viewPlayers.dataset.tid,viewPlayers.dataset.tname);}
    });
    // User search
    $('userSearchInput')?.addEventListener('input', async(e)=>{
        const q=e.target.value.trim().toLowerCase();
        if(!q){loadUsers();return;}
        const {data}=await supabase.from('users').select('*, wallets(main_balance,winning_cash,bonus_cash)')
            .eq('tenant_id',tenant.id).or(`username.ilike.%${q}%,email.ilike.%${q}%`);
        const tbody=$('usersTableBody');if(!tbody||!data)return;
        tbody.innerHTML=data.map(u=>{const w=u.wallets?.[0]||{};const bal=Number(w.main_balance||0)+Number(w.winning_cash||0)+Number(w.bonus_cash||0);
            return `<tr><td><small>${(u.user_app_id||u.id).substring(0,8)}</small></td><td>${u.username||'N/A'}</td><td>${u.email||'N/A'}</td><td>${fmt(bal)}</td><td><span class="badge bg-success">Active</span></td><td><button class="btn btn-sm btn-outline-info view-user-btn" data-uid="${u.id}"><i class="bi bi-eye"></i></button></td></tr>`;
        }).join('');
    });

    // Resolve tenant
    tenant = await resolveTenant();
    if(!tenant){showAuth();return;}

    // Auth listener
    supabase.auth.onAuthStateChange(async(event, session)=>{
        if(session?.user){
            const {data}=await supabase.from('users').select('*').eq('id',session.user.id).single();
            if(!data||data.role!=='admin'){alert('Not authorized as admin.');await supabase.auth.signOut();showAuth();return;}
            currentUser={auth:session.user,db:data};
            showMain(); loadSettings();
        } else { currentUser=null; showAuth(); }
    });
});

async function loadRegisteredPlayers(tournamentId,tournamentName){
    const tbody=$('registeredPlayersTableBody');
    const titleEl=$('registeredPlayersTournamentName');
    if(titleEl) titleEl.textContent=tournamentName||'';
    if(tbody) tbody.innerHTML='<tr><td colspan="5" class="text-center p-3">Loading...</td></tr>';
    new bootstrap.Modal($('registeredPlayersModal')).show();
    try{
        const {data}=await supabase.from('tournament_participants').select('*, users(username,email,user_app_id)')
            .eq('tournament_id',tournamentId).order('joined_at',{ascending:true});
        if(!data||!data.length){tbody.innerHTML='<tr><td colspan="5" class="text-center p-3">No players registered.</td></tr>';return;}
        tbody.innerHTML=data.map((p,i)=>{
            const u=p.users||{};const team=p.team_data?JSON.parse(p.team_data):null;
            const ign=team?.players?.[0]||'N/A';
            return `<tr><td>${i+1}</td><td>${ign}</td><td>${u.email||'N/A'}</td><td><small>${(u.user_app_id||p.user_id).substring(0,8)}</small></td><td>${new Date(p.joined_at).toLocaleString()}</td></tr>`;
        }).join('');
    }catch(err){console.error(err);if(tbody)tbody.innerHTML='<tr><td colspan="5" class="text-center text-danger p-3">Error loading players.</td></tr>';}
}
