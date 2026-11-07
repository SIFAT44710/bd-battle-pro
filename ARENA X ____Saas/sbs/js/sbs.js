// ==================================================
// SIFR TOURNAMENT BY SBS - SBS Super Admin Logic
// ==================================================
import { supabase } from '../../lib/supabaseClient.js';
import { getCurrentUser, logOut } from '../../lib/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup UI Listeners FIRST so buttons always work even if data fails
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await logOut();
    });

    // Modal listeners
    document.getElementById('closeApprovalModalBtn').addEventListener('click', () => {
        document.getElementById('tenantApprovalModal').classList.add('hide');
    });

    document.getElementById('activatePlatformBtn').addEventListener('click', handleActivatePlatform);

    // 2. Verify Authentication & Role
    try {
        const userSession = await getCurrentUser();
        
        if (!userSession) {
            console.warn("No session found. Please login.");
            // window.location.href = '/login.html';
            return;
        }

        if (userSession.db && userSession.db.role !== 'super_admin') {
            console.warn("Not super admin.");
            // window.location.href = '/player/dashboard.html';
            return;
        }

        document.getElementById('adminEmail').textContent = userSession.auth.email;
    } catch(err) {
        console.error("Auth error:", err);
    }

    // 3. Load Data
    await loadDashboardStats();
    await loadTenants();
    initChart();
});

async function loadDashboardStats() {
    try {
        // Fetch Tenants
        const { data: tenants, error: tenantErr } = await supabase.from('tenants').select('id, status');
        if (tenantErr) throw tenantErr;

        let total = tenants.length;
        let active = tenants.filter(t => t.status === 'active').length;
        let pending = tenants.filter(t => t.status === 'pending').length;
        // Mocking expiring soon for now, later we check `tenant_settings.expiry_date`
        let expiring = 0; 

        document.getElementById('statEmpires').textContent = total;
        document.getElementById('statLive').textContent = active;
        document.getElementById('statPending').textContent = pending;
        document.getElementById('statExpiring').textContent = expiring;

    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

async function loadTenants() {
    const tbody = document.getElementById('tenantsTableBody');
    try {
        const { data: tenants, error } = await supabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (tenants.length === 0) {
            tbody.innerHTML = '<tr><td class="px-6 py-4 text-center text-gray-500" colspan="6">No tenants found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        tenants.forEach(tenant => {
            const isPending = tenant.status === 'pending';
            const statusColor = tenant.status === 'active' ? 'text-green-400 bg-green-400/10 border border-green-500/30' 
                              : isPending ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-500/30' 
                              : 'text-red-400 bg-red-400/10 border border-red-500/30';

            const actionBtn = isPending 
                ? `<button onclick="openApprovalModal('${tenant.name}')" class="px-3 py-1 bg-cyan-600/80 hover:bg-cyan-500 rounded text-xs text-black font-bold shadow-[0_0_10px_rgba(34,211,238,0.4)]">Approve</button>`
                : `<button class="text-gray-400 hover:text-cyan-400 mx-1" title="Explore Host"><i class="fas fa-external-link-alt"></i></button>
                   <button class="text-gray-400 hover:text-red-400 mx-1" title="Suspend"><i class="fas fa-ban"></i></button>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-white">${tenant.name}</td>
                <td class="px-6 py-4 text-gray-400 text-xs">${tenant.verified_domain || tenant.verified_subdomain || 'Pending DNS'}</td>
                <td class="px-6 py-4 text-gray-400 text-xs">--</td>
                <td class="px-6 py-4 text-gray-400 text-xs">--</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}">
                        ${tenant.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    ${actionBtn}
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error loading tenants:", err);
        tbody.innerHTML = '<tr><td class="px-6 py-4 text-center text-red-500" colspan="6">Error loading data.</td></tr>';
    }
}

function initChart() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    
    // Giraffe Graph (Neon Cyan style)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.5)'); // Cyan start
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.0)'); // Transparent end

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Global Revenue (BDT)',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 45000],
                borderColor: '#22d3ee', // Cyan-400
                backgroundColor: gradient,
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#22d3ee',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#9ca3af' }
                }
            }
        }
    });
}

// Global variable to keep track of the currently selected tenant for approval
window.openApprovalModal = function(name) {
    document.getElementById('modalTenantName').textContent = name;
    // We could store the tenant ID here, but for simplicity we'll just store the name
    window.currentPendingTenantName = name; 
    document.getElementById('tenantApprovalModal').classList.remove('hide');
}

async function handleActivatePlatform() {
    const btn = document.getElementById('activatePlatformBtn');
    if(!window.currentPendingTenantName) return;

    btn.textContent = "Activating...";
    btn.disabled = true;

    try {
        // Update the tenant status to active
        const { error } = await supabase
            .from('tenants')
            .update({ status: 'active' })
            .eq('name', window.currentPendingTenantName);

        if(error) throw error;

        // Note: You would also save the package/expiry in tenant_settings or another table

        alert('Platform activated successfully!');
        document.getElementById('tenantApprovalModal').classList.add('hide');
        await loadDashboardStats();
        await loadTenants();
    } catch(err) {
        console.error(err);
        alert('Error activating platform: ' + err.message);
    } finally {
        btn.textContent = "Activate Platform";
        btn.disabled = false;
    }
}
