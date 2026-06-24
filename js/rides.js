// rides.js — Rides page logic

let currentFilter = 'all';
let searchQuery   = '';

document.addEventListener('DOMContentLoaded', () => {
  renderRides();
  bindFilters();
  bindModal();
  populateModalDropdowns();
});

// ── Render Table ───────────────────────────────────
function renderRides() {
  const all   = DB.get('rides') || [];
  const rides = all
    .filter(r => currentFilter === 'all' || r.status === currentFilter)
    .filter(r => {
      const q = searchQuery.toLowerCase();
      return !q || r.driverName.toLowerCase().includes(q) || r.routeName.toLowerCase().includes(q);
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  // Update subtitle
  const countEl = document.getElementById('rides-count');
  if (countEl) countEl.textContent = `${rides.length} ride${rides.length !== 1 ? 's' : ''} found`;

  const tbody = document.getElementById('rides-tbody');
  if (!tbody) return;

  if (rides.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <div class="empty-icon">🚗</div>
        <div class="empty-title">No rides found</div>
        <div class="empty-text">Try a different filter or add a new ride.</div>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = rides.map(r => `
    <tr>
      <td>
        <div style="font-weight:600">${formatDate(r.date)}</div>
        <div class="text-muted text-xs">${r.time}</div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:9px">
          ${avatar(r.driverName, 30)}
          <span style="font-weight:600">${r.driverName}</span>
        </div>
      </td>
      <td>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${r.passengers.map(p => `<span style="font-size:12px;background:rgba(99,102,241,0.1);border-radius:20px;padding:2px 8px;color:var(--text-secondary)">${p}</span>`).join('')}
        </div>
      </td>
      <td style="max-width:200px">
        <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.routeName}</div>
      </td>
      <td class="text-muted">${r.distance} km</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <div style="display:flex;gap:6px">
          ${r.status === 'scheduled' ? `<button class="btn btn-sm" style="background:var(--emerald-glow);color:var(--emerald-light);border:1px solid rgba(16,185,129,0.2)" onclick="markStatus('${r.id}','active')">Start</button>` : ''}
          ${r.status === 'active'    ? `<button class="btn btn-sm" style="background:var(--sky-glow);color:var(--sky);border:1px solid rgba(14,165,233,0.2)" onclick="markStatus('${r.id}','completed')">Complete</button>` : ''}
          <button class="btn btn-ghost btn-sm btn-icon" onclick="deleteRide('${r.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Filter Tabs ────────────────────────────────────
function bindFilters() {
  document.getElementById('filter-tabs')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderRides();
  });

  document.getElementById('ride-search')?.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderRides();
  });
}

// ── Status Actions ─────────────────────────────────
function markStatus(id, newStatus) {
  const rides = DB.get('rides') || [];
  const idx = rides.findIndex(r => r.id === id);
  if (idx < 0) return;
  rides[idx].status = newStatus;
  DB.set('rides', rides);
  renderRides();
  toast(`Ride marked as ${newStatus}!`);
}

function deleteRide(id) {
  if (!confirm('Delete this ride? This cannot be undone.')) return;
  const rides = (DB.get('rides') || []).filter(r => r.id !== id);
  DB.set('rides', rides);
  renderRides();
  toast('Ride deleted', 'info');
}

// ── Modal ──────────────────────────────────────────
function populateModalDropdowns() {
  const employees = DB.get('employees') || [];
  const routes    = DB.get('routes')    || [];

  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('ride-date');
  if (dateEl) dateEl.value = today;

  // Drivers dropdown
  const driverSel = document.getElementById('ride-driver');
  if (driverSel) {
    driverSel.innerHTML = employees
      .filter(e => e.role === 'driver' || e.role === 'both')
      .map(e => `<option value="${e.id}" data-name="${e.name}">${e.name} (${e.department})</option>`)
      .join('');
  }

  // Routes dropdown
  const routeSel = document.getElementById('ride-route');
  if (routeSel) {
    routeSel.innerHTML = routes.map(r =>
      `<option value="${r.id}" data-name="${r.name}" data-dist="${r.distance}">${r.name}</option>`
    ).join('');
  }

  // Passengers multi-select
  const passSel = document.getElementById('ride-passengers');
  if (passSel) {
    passSel.innerHTML = employees
      .filter(e => e.role !== 'driver')
      .map(e => `<option value="${e.name}">${e.name} (${e.department})</option>`)
      .join('');
  }
}

function bindModal() {
  document.getElementById('btn-add-ride')?.addEventListener('click', () => {
    populateModalDropdowns();
    openModal('modal-add-ride');
  });

  document.getElementById('btn-save-ride')?.addEventListener('click', saveRide);
}

function saveRide() {
  const date      = document.getElementById('ride-date')?.value;
  const time      = document.getElementById('ride-time')?.value;
  const driverSel = document.getElementById('ride-driver');
  const routeSel  = document.getElementById('ride-route');
  const passSel   = document.getElementById('ride-passengers');
  const seats     = document.getElementById('ride-seats')?.value || 4;
  const status    = document.getElementById('ride-status')?.value || 'scheduled';

  if (!date || !driverSel.value || !routeSel.value) {
    toast('Please fill in all required fields.', 'error');
    return;
  }

  const selDriver = driverSel.options[driverSel.selectedIndex];
  const selRoute  = routeSel.options[routeSel.selectedIndex];
  const passengers = [...passSel.selectedOptions].map(o => o.value);

  const ride = {
    id:         generateId('ride'),
    date, time, status,
    driverId:   driverSel.value,
    driverName: selDriver.dataset.name,
    routeId:    routeSel.value,
    routeName:  selRoute.dataset.name,
    distance:   parseFloat(selRoute.dataset.dist) || 0,
    passengers,
    seats:      parseInt(seats)
  };

  const rides = DB.get('rides') || [];
  rides.unshift(ride);
  DB.set('rides', rides);

  closeModal('modal-add-ride');
  renderRides();
  toast('✅ Ride scheduled successfully!');
}
