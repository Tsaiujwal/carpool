// analytics.js — Analytics page logic

document.addEventListener('DOMContentLoaded', () => {
  renderKPIs();
  renderCO2Chart();
  renderDeptChart();
  renderUtilChart();
  renderMonthlyRidesChart();
  renderMonthlyTable();
  bindExport();
});

const chartDefaults = {
  tooltip: {
    backgroundColor: '#1e293b',
    borderColor: 'rgba(99,102,241,0.3)',
    borderWidth: 1,
    titleColor: '#f1f5f9',
    bodyColor: '#94a3b8',
    padding: 12,
    cornerRadius: 8
  },
  scale: {
    grid: { color: 'rgba(148,163,184,0.05)' },
    ticks: { color: '#64748b', font: { size: 12, family: 'Inter' } }
  }
};

// ── KPI Summary ────────────────────────────────────
function renderKPIs() {
  const data = DB.get('analytics') || {};
  const monthly = data.monthlyData || [];
  const totals  = monthly.reduce((acc, m) => ({
    rides:   acc.rides   + m.rides,
    drivers: Math.max(acc.drivers, m.drivers),
    co2:     acc.co2     + m.co2,
    km:      acc.km      + m.km
  }), { rides: 0, drivers: 0, co2: 0, km: 0 });

  const kpis = [
    { label:'Total Rides (YTD)',     value: totals.rides,          icon:'🚗', color:'indigo' },
    { label:'Peak Active Drivers',   value: totals.drivers,        icon:'👤', color:'emerald' },
    { label:'CO₂ Saved (kg)',        value: totals.co2.toFixed(1), icon:'🌿', color:'amber' },
    { label:'Total KM Carpooled',    value: totals.km.toLocaleString(), icon:'📍', color:'rose' }
  ];

  const grid = document.getElementById('analytics-kpis');
  if (!grid) return;

  grid.innerHTML = kpis.map(k => `
    <div class="stat-card ${k.color}">
      <div class="stat-card-icon">${k.icon}</div>
      <div class="stat-card-value">${k.value}</div>
      <div class="stat-card-label">${k.label}</div>
      <div class="stat-card-change up">▲ Jan – Jun 2026</div>
    </div>
  `).join('');
}

// ── CO₂ Line Chart ─────────────────────────────────
function renderCO2Chart() {
  const data = DB.get('analytics') || {};
  const co2  = data.co2ByMonth || [];

  const ctx = document.getElementById('co2Chart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: co2.map(d => d.month),
      datasets: [{
        label: 'CO₂ Saved (kg)',
        data: co2.map(d => d.value),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        tension: 0.45,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: chartDefaults.tooltip },
      scales: {
        x: { grid: chartDefaults.scale.grid, ticks: chartDefaults.scale.ticks },
        y: { grid: chartDefaults.scale.grid, ticks: chartDefaults.scale.ticks, beginAtZero: true }
      }
    }
  });
}

// ── Dept Bar Chart ─────────────────────────────────
function renderDeptChart() {
  const data = DB.get('analytics') || {};
  const depts = data.ridesByDept || [];

  const ctx = document.getElementById('deptChart');
  if (!ctx) return;

  const colors = ['#6366f1','#10b981','#8b5cf6','#f43f5e','#f59e0b','#0ea5e9'];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: depts.map(d => d.dept),
      datasets: [{
        label: 'Rides',
        data: depts.map(d => d.rides),
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: chartDefaults.tooltip },
      scales: {
        x: { grid: { display: false }, ticks: chartDefaults.scale.ticks },
        y: { grid: chartDefaults.scale.grid, ticks: chartDefaults.scale.ticks, beginAtZero: true }
      }
    }
  });
}

// ── Driver Utilization Donut ───────────────────────
function renderUtilChart() {
  const data = DB.get('analytics') || {};
  const util = data.driverUtil || [];

  const ctx = document.getElementById('utilChart');
  if (!ctx) return;

  const colors = ['#6366f1','#f59e0b','#64748b'];

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: util.map(d => d.label),
      datasets: [{
        data: util.map(d => d.value),
        backgroundColor: colors,
        borderColor: '#0f172a',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: chartDefaults.tooltip
      },
      cutout: '65%'
    }
  });

  // Legend
  const legend = document.getElementById('util-legend');
  if (legend) {
    const total = util.reduce((s, d) => s + d.value, 0);
    legend.innerHTML = util.map((d, i) => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:12px;height:12px;border-radius:50%;background:${colors[i]};flex-shrink:0"></div>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${d.label}</div>
          <div style="font-size:12px;color:var(--text-muted)">${d.value} employees · ${Math.round(d.value/total*100)}%</div>
        </div>
      </div>
    `).join('');
  }
}

// ── Monthly Rides Bar Chart ────────────────────────
function renderMonthlyRidesChart() {
  const data    = DB.get('analytics') || {};
  const monthly = data.monthlyData || [];

  const ctx = document.getElementById('monthlyRidesChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthly.map(m => m.month.split(' ')[0]),
      datasets: [
        {
          label: 'Rides',
          data: monthly.map(m => m.rides),
          backgroundColor: 'rgba(99,102,241,0.8)',
          borderRadius: 6, borderSkipped: false
        },
        {
          label: 'Drivers',
          data: monthly.map(m => m.drivers),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 6, borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12, borderRadius: 4 }
        },
        tooltip: chartDefaults.tooltip
      },
      scales: {
        x: { grid: { display: false }, ticks: chartDefaults.scale.ticks },
        y: { grid: chartDefaults.scale.grid, ticks: chartDefaults.scale.ticks, beginAtZero: true }
      }
    }
  });
}

// ── Monthly Table ──────────────────────────────────
function renderMonthlyTable() {
  const data    = DB.get('analytics') || {};
  const monthly = (data.monthlyData || []).slice().reverse();

  const tbody = document.getElementById('monthly-tbody');
  if (!tbody) return;

  tbody.innerHTML = monthly.map(m => `
    <tr>
      <td>${m.month}</td>
      <td><span class="metric-highlight">${m.rides}</span></td>
      <td>${m.drivers}</td>
      <td style="color:var(--emerald-light);font-weight:600">${m.co2.toFixed(1)} kg</td>
      <td class="text-muted">${m.km.toLocaleString()} km</td>
    </tr>
  `).join('');
}

// ── Export CSV ─────────────────────────────────────
function bindExport() {
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const data    = DB.get('analytics') || {};
    const monthly = data.monthlyData || [];
    const rows    = [['Month','Rides','Drivers','CO2_kg','KM']];
    monthly.forEach(m => rows.push([m.month, m.rides, m.drivers, m.co2, m.km]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'corppool_analytics.csv';
    a.click();
    toast('Report exported!');
  });
}
