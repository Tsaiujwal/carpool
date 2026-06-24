// routes.js — Routes page logic

let routeSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  renderRoutes();
  bindRouteFilters();
  bindRouteModal();
});

// ── Render Route Cards ─────────────────────────────
function renderRoutes() {
  const all = DB.get('routes') || [];
  const routes = all.filter(r => {
    const q = routeSearch.toLowerCase();
    return !q || r.name.toLowerCase().includes(q) || r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q);
  });

  const countEl = document.getElementById('route-count');
  if (countEl) countEl.textContent = `${routes.length} route${routes.length !== 1 ? 's' : ''} registered`;

  const grid = document.getElementById('route-grid');
  if (!grid) return;

  if (routes.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🗺️</div>
      <div class="empty-title">No routes found</div>
      <div class="empty-text">Add a new route to get started.</div>
    </div>`;
    return;
  }

  grid.innerHTML = routes.map(r => `
    <div class="route-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div class="route-name">${r.name}</div>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteRoute('${r.id}')" title="Delete">🗑️</button>
      </div>
      <div class="route-path">
        <span class="route-endpoint">📍 ${r.from}</span>
        <div class="route-line"></div>
        <span class="route-endpoint">🏢 ${r.to}</span>
      </div>
      <div class="route-stats">
        <div class="route-stat">
          <div class="route-stat-value" style="color:var(--indigo-light)">${r.distance}</div>
          <div class="route-stat-label">km</div>
        </div>
        <div class="route-stat">
          <div class="route-stat-value" style="color:var(--amber)">${r.duration}</div>
          <div class="route-stat-label">min</div>
        </div>
        <div class="route-stat">
          <div class="route-stat-value" style="color:var(--emerald-light)">${r.totalRides || 0}</div>
          <div class="route-stat-label">rides</div>
        </div>
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <span class="text-sm text-muted">Active rides</span>
        <span class="badge active"><span class="badge-dot"></span>${r.activeRides || 0} active</span>
      </div>
    </div>
  `).join('');
}

// ── Filters ────────────────────────────────────────
function bindRouteFilters() {
  document.getElementById('route-search')?.addEventListener('input', e => {
    routeSearch = e.target.value;
    renderRoutes();
  });
}

// ── Delete ─────────────────────────────────────────
function deleteRoute(id) {
  if (!confirm('Delete this route?')) return;
  const routes = (DB.get('routes') || []).filter(r => r.id !== id);
  DB.set('routes', routes);
  renderRoutes();
  toast('Route deleted', 'info');
}

// ── Add Route Modal ────────────────────────────────
function bindRouteModal() {
  document.getElementById('btn-add-route')?.addEventListener('click', () => {
    ['route-name','route-from','route-to','route-distance','route-duration'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    openModal('modal-add-route');
  });

  document.getElementById('btn-save-route')?.addEventListener('click', saveRoute);
}

function saveRoute() {
  const name     = document.getElementById('route-name')?.value.trim();
  const from     = document.getElementById('route-from')?.value.trim();
  const to       = document.getElementById('route-to')?.value.trim();
  const distance = parseFloat(document.getElementById('route-distance')?.value || 0);
  const duration = parseInt(document.getElementById('route-duration')?.value || 0);

  if (!name || !from || !to) {
    toast('Please fill in all required fields.', 'error');
    return;
  }

  const route = {
    id: generateId('rt'),
    name, from, to, distance, duration,
    activeRides: 0,
    totalRides:  0
  };

  const routes = DB.get('routes') || [];
  routes.push(route);
  DB.set('routes', routes);

  closeModal('modal-add-route');
  renderRoutes();
  toast('Route added successfully!');
}
