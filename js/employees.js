// employees.js — Employees page logic

let empSearch = '';
let empDept   = 'all';
let empRole   = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderEmployees();
  bindEmployeeFilters();
  bindEmployeeModal();
});

// ── Render Employee Cards ──────────────────────────
function renderEmployees() {
  const all = DB.get('employees') || [];
  const filtered = all.filter(e => {
    const q = empSearch.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
    const matchD = empDept === 'all' || e.department === empDept;
    const matchR = empRole === 'all' || e.role === empRole;
    return matchQ && matchD && matchR;
  });

  // Update count
  const countEl = document.getElementById('emp-count');
  if (countEl) countEl.textContent = `${filtered.length} employee${filtered.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('employee-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">👥</div>
      <div class="empty-title">No employees found</div>
      <div class="empty-text">Try a different filter or add an employee.</div>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(e => {
    const joinYear = new Date(e.joinDate).getFullYear();
    const co2 = (e.co2Saved || 0).toFixed(1);
    return `
      <div class="employee-card">
        <div class="employee-card-header">
          ${avatar(e.name, 44)}
          <div style="flex:1;min-width:0">
            <div class="employee-name">${e.name}</div>
            <div class="employee-email">${e.email}</div>
            <div style="margin-top:6px">${deptBadge(e.department)}</div>
          </div>
          <button class="btn btn-ghost btn-icon" onclick="deleteEmployee('${e.id}')" title="Remove">🗑️</button>
        </div>
        <div class="employee-card-body">
          <div class="employee-stat">
            <span class="employee-stat-label">Total Rides</span>
            <span class="employee-stat-value">🚗 ${e.totalRides}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, (e.totalRides / 65) * 100)}%"></div></div>
          <div class="employee-stat" style="margin-top:6px">
            <span class="employee-stat-label">CO₂ Saved</span>
            <span class="employee-stat-value" style="color:var(--emerald-light)">🌿 ${co2} kg</span>
          </div>
          <div class="employee-stat">
            <span class="employee-stat-label">Joined</span>
            <span class="employee-stat-value">${joinYear}</span>
          </div>
        </div>
        <div class="employee-card-footer">
          ${roleBadge(e.role)}
          <span class="text-xs text-muted">${e.phone || '—'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ── Filters ────────────────────────────────────────
function bindEmployeeFilters() {
  document.getElementById('emp-search')?.addEventListener('input', e => {
    empSearch = e.target.value;
    renderEmployees();
  });

  document.getElementById('dept-filter')?.addEventListener('change', e => {
    empDept = e.target.value;
    renderEmployees();
  });

  document.getElementById('role-filter')?.addEventListener('change', e => {
    empRole = e.target.value;
    renderEmployees();
  });
}

// ── Delete ─────────────────────────────────────────
function deleteEmployee(id) {
  if (!confirm('Remove this employee from the carpool system?')) return;
  const employees = (DB.get('employees') || []).filter(e => e.id !== id);
  DB.set('employees', employees);
  renderEmployees();
  toast('Employee removed', 'info');
}

// ── Add Employee Modal ─────────────────────────────
function bindEmployeeModal() {
  document.getElementById('btn-add-emp')?.addEventListener('click', () => {
    // Clear fields
    ['emp-name','emp-email','emp-phone'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    openModal('modal-add-emp');
  });

  document.getElementById('btn-save-emp')?.addEventListener('click', saveEmployee);
}

function saveEmployee() {
  const name  = document.getElementById('emp-name')?.value.trim();
  const email = document.getElementById('emp-email')?.value.trim();
  const dept  = document.getElementById('emp-dept')?.value;
  const role  = document.getElementById('emp-role')?.value;
  const phone = document.getElementById('emp-phone')?.value.trim();

  if (!name || !email) {
    toast('Name and email are required.', 'error');
    return;
  }

  const emp = {
    id:         generateId('e'),
    name, email, department: dept, role, phone,
    totalRides: 0,
    co2Saved:   0,
    joinDate:   new Date().toISOString().split('T')[0]
  };

  const employees = DB.get('employees') || [];
  employees.push(emp);
  DB.set('employees', employees);

  closeModal('modal-add-emp');
  renderEmployees();
  toast(`${name} added to the carpool system!`);
}
