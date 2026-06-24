// settings.js — Settings page logic

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  buildDaySelector();
  bindSave();
  bindReset();
});

// ── Load Settings into Form ────────────────────────
function loadSettings() {
  const s = DB.get('settings') || {};

  setVal('s-company-name', s.companyName || '');
  setVal('s-email',        s.companyEmail || '');
  setVal('s-phone',        s.companyPhone || '');
  setVal('s-address',      s.companyAddress || '');
  setVal('s-work-start',   s.workStart || '08:00');
  setVal('s-work-end',     s.workEnd   || '18:00');

  // Notifications
  const n = s.notifications || {};
  setCheck('n-rideStarted',   n.rideStarted   ?? true);
  setCheck('n-rideCompleted', n.rideCompleted ?? true);
  setCheck('n-cancelledRide', n.cancelledRide ?? true);
  setCheck('n-newEmployee',   n.newEmployee   ?? false);
  setCheck('n-weeklyReport',  n.weeklyReport  ?? true);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function setCheck(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = checked;
}

// ── Day Selector ───────────────────────────────────
function buildDaySelector() {
  const s    = DB.get('settings') || {};
  const work = s.workDays || ['Mon','Tue','Wed','Thu','Fri'];
  const container = document.getElementById('work-days-selector');
  if (!container) return;

  container.innerHTML = DAYS.map(d => {
    const active = work.includes(d);
    return `
      <button class="day-btn ${active ? 'active' : ''}"
              data-day="${d}"
              onclick="toggleDay(this)"
              style="padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid ${active ? 'var(--indigo)' : 'var(--border)'};background:${active ? 'var(--indigo-glow)' : 'var(--bg-secondary)'};color:${active ? 'var(--indigo-light)' : 'var(--text-muted)'};transition:all 0.2s ease;font-family:inherit">
        ${d}
      </button>`;
  }).join('');
}

function toggleDay(btn) {
  const active = btn.classList.toggle('active');
  btn.style.background    = active ? 'var(--indigo-glow)' : 'var(--bg-secondary)';
  btn.style.color         = active ? 'var(--indigo-light)' : 'var(--text-muted)';
  btn.style.borderColor   = active ? 'var(--indigo)' : 'var(--border)';
}

// ── Save ───────────────────────────────────────────
function bindSave() {
  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    const s = DB.get('settings') || {};

    s.companyName    = document.getElementById('s-company-name')?.value.trim() || s.companyName;
    s.companyEmail   = document.getElementById('s-email')?.value.trim()        || s.companyEmail;
    s.companyPhone   = document.getElementById('s-phone')?.value.trim()        || s.companyPhone;
    s.companyAddress = document.getElementById('s-address')?.value.trim()      || s.companyAddress;
    s.workStart      = document.getElementById('s-work-start')?.value          || s.workStart;
    s.workEnd        = document.getElementById('s-work-end')?.value            || s.workEnd;

    // Working days
    s.workDays = [...document.querySelectorAll('.day-btn.active')].map(b => b.dataset.day);

    // Notifications
    s.notifications = {
      rideStarted:   document.getElementById('n-rideStarted')?.checked   ?? true,
      rideCompleted: document.getElementById('n-rideCompleted')?.checked ?? true,
      cancelledRide: document.getElementById('n-cancelledRide')?.checked ?? true,
      newEmployee:   document.getElementById('n-newEmployee')?.checked   ?? false,
      weeklyReport:  document.getElementById('n-weeklyReport')?.checked  ?? true
    };

    DB.set('settings', s);
    toast('Settings saved successfully!');

    // Refresh sidebar company name
    const nameEl = document.querySelector('.user-name');
    if (nameEl) nameEl.textContent = s.companyName;
  });
}

// ── Reset ──────────────────────────────────────────
function bindReset() {
  document.getElementById('btn-reset-data')?.addEventListener('click', () => {
    if (!confirm('⚠️ This will reset ALL data (rides, employees, routes) to defaults. Are you sure?')) return;
    localStorage.clear();
    toast('Data reset. Refreshing…', 'info');
    setTimeout(() => location.reload(), 1500);
  });
}
