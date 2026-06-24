/* ==========================================
   APP.JS — Shared data, utilities & navigation
   ========================================== */

// ==========================================
// AUTH — Session guard
// ==========================================
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

function requireAuth() {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'login.html') return; // never redirect on the login page itself
  try {
    const session = JSON.parse(localStorage.getItem('cp_session') || 'null');
    if (!session || !session.loggedIn || (Date.now() - session.timestamp > SESSION_TTL)) {
      window.location.href = 'login.html';
    }
  } catch {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('cp_session');
  window.location.href = 'login.html';
}

// Avatar colors palette
const AVATAR_COLORS = [
  '#6366f1','#10b981','#f59e0b','#f43f5e','#0ea5e9',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16'
];

// ==========================================
// DEFAULT DATA
// ==========================================
const DEFAULT_EMPLOYEES = [
  { id:'e1',  name:'Arjun Mehta',      email:'arjun@corppool.com',   department:'Engineering', role:'driver',    totalRides:48, co2Saved:24.5, joinDate:'2023-03-15', phone:'+91 98765 43210' },
  { id:'e2',  name:'Priya Sharma',     email:'priya@corppool.com',   department:'Sales',       role:'passenger', totalRides:32, co2Saved:16.2, joinDate:'2023-01-20', phone:'+91 98765 43211' },
  { id:'e3',  name:'Rahul Gupta',      email:'rahul@corppool.com',   department:'Engineering', role:'both',      totalRides:55, co2Saved:28.1, joinDate:'2022-11-10', phone:'+91 98765 43212' },
  { id:'e4',  name:'Sneha Patel',      email:'sneha@corppool.com',   department:'HR',          role:'passenger', totalRides:21, co2Saved:10.8, joinDate:'2023-06-01', phone:'+91 98765 43213' },
  { id:'e5',  name:'Vikram Singh',     email:'vikram@corppool.com',  department:'Finance',     role:'driver',    totalRides:61, co2Saved:31.4, joinDate:'2022-08-22', phone:'+91 98765 43214' },
  { id:'e6',  name:'Ananya Rao',       email:'ananya@corppool.com',  department:'Marketing',   role:'both',      totalRides:38, co2Saved:19.3, joinDate:'2023-02-14', phone:'+91 98765 43215' },
  { id:'e7',  name:'Karan Joshi',      email:'karan@corppool.com',   department:'Engineering', role:'driver',    totalRides:44, co2Saved:22.4, joinDate:'2022-12-05', phone:'+91 98765 43216' },
  { id:'e8',  name:'Meera Nair',       email:'meera@corppool.com',   department:'HR',          role:'passenger', totalRides:19, co2Saved:9.6,  joinDate:'2023-07-11', phone:'+91 98765 43217' },
  { id:'e9',  name:'Deepak Kumar',     email:'deepak@corppool.com',  department:'Operations',  role:'driver',    totalRides:52, co2Saved:26.6, joinDate:'2022-10-30', phone:'+91 98765 43218' },
  { id:'e10', name:'Nisha Reddy',      email:'nisha@corppool.com',   department:'Sales',       role:'passenger', totalRides:28, co2Saved:14.2, joinDate:'2023-04-18', phone:'+91 98765 43219' },
  { id:'e11', name:'Amit Tiwari',      email:'amit@corppool.com',    department:'Finance',     role:'both',      totalRides:33, co2Saved:17.0, joinDate:'2023-01-08', phone:'+91 98765 43220' },
  { id:'e12', name:'Pooja Verma',      email:'pooja@corppool.com',   department:'Marketing',   role:'passenger', totalRides:15, co2Saved:7.8,  joinDate:'2023-08-01', phone:'+91 98765 43221' },
  { id:'e13', name:'Rohit Agarwal',    email:'rohit@corppool.com',   department:'Engineering', role:'driver',    totalRides:57, co2Saved:29.0, joinDate:'2022-09-15', phone:'+91 98765 43222' },
  { id:'e14', name:'Kavita Shah',      email:'kavita@corppool.com',  department:'Operations',  role:'both',      totalRides:41, co2Saved:20.9, joinDate:'2022-11-28', phone:'+91 98765 43223' },
  { id:'e15', name:'Suresh Bose',      email:'suresh@corppool.com',  department:'Sales',       role:'driver',    totalRides:36, co2Saved:18.4, joinDate:'2023-03-03', phone:'+91 98765 43224' },
  { id:'e16', name:'Divya Menon',      email:'divya@corppool.com',   department:'HR',          role:'passenger', totalRides:23, co2Saved:11.7, joinDate:'2023-05-20', phone:'+91 98765 43225' },
  { id:'e17', name:'Ravi Pillai',      email:'ravi@corppool.com',    department:'Engineering', role:'both',      totalRides:49, co2Saved:25.0, joinDate:'2022-07-17', phone:'+91 98765 43226' },
  { id:'e18', name:'Sunita Das',       email:'sunita@corppool.com',  department:'Finance',     role:'passenger', totalRides:17, co2Saved:8.7,  joinDate:'2023-09-10', phone:'+91 98765 43227' },
  { id:'e19', name:'Manoj Patil',      email:'manoj@corppool.com',   department:'Operations',  role:'driver',    totalRides:63, co2Saved:32.2, joinDate:'2022-06-01', phone:'+91 98765 43228' },
  { id:'e20', name:'Isha Choudhary',   email:'isha@corppool.com',    department:'Marketing',   role:'passenger', totalRides:26, co2Saved:13.3, joinDate:'2023-04-25', phone:'+91 98765 43229' }
];

const DEFAULT_ROUTES = [
  { id:'rt1', name:'North Campus → HQ',               from:'North Campus',  to:'HQ Tower',           distance:12.4, duration:28, activeRides:5, totalRides:124 },
  { id:'rt2', name:'East Side → Tech Park',            from:'East Side Hub', to:'Tech Park',          distance:8.7,  duration:22, activeRides:3, totalRides:89  },
  { id:'rt3', name:'South Gate → Main Office',         from:'South Gate',    to:'Main Office',        distance:15.1, duration:35, activeRides:4, totalRides:156 },
  { id:'rt4', name:'West End → Innovation Center',     from:'West End',      to:'Innovation Center',  distance:10.3, duration:25, activeRides:2, totalRides:67  },
  { id:'rt5', name:'City Center → Corporate HQ',       from:'City Center',   to:'Corporate HQ',       distance:6.2,  duration:18, activeRides:6, totalRides:203 }
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2*86400000).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 3*86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfter = new Date(Date.now() + 2*86400000).toISOString().split('T')[0];

const DEFAULT_RIDES = [
  { id:'ride1',  date:today,         time:'08:30', driverId:'e1',  driverName:'Arjun Mehta',    passengers:['Priya Sharma','Meera Nair'],                    routeId:'rt1', routeName:'North Campus → HQ',           status:'active',    distance:12.4, seats:4 },
  { id:'ride2',  date:today,         time:'09:00', driverId:'e5',  driverName:'Vikram Singh',   passengers:['Nisha Reddy','Pooja Verma','Sunita Das'],        routeId:'rt3', routeName:'South Gate → Main Office',    status:'active',    distance:15.1, seats:5 },
  { id:'ride3',  date:today,         time:'09:15', driverId:'e3',  driverName:'Rahul Gupta',    passengers:['Sneha Patel'],                                  routeId:'rt2', routeName:'East Side → Tech Park',       status:'scheduled', distance:8.7,  seats:3 },
  { id:'ride4',  date:today,         time:'08:00', driverId:'e19', driverName:'Manoj Patil',    passengers:['Isha Choudhary','Divya Menon'],                 routeId:'rt5', routeName:'City Center → Corporate HQ', status:'completed', distance:6.2,  seats:4 },
  { id:'ride5',  date:yesterday,     time:'08:30', driverId:'e13', driverName:'Rohit Agarwal',  passengers:['Amit Tiwari','Suresh Bose'],                    routeId:'rt1', routeName:'North Campus → HQ',           status:'completed', distance:12.4, seats:4 },
  { id:'ride6',  date:yesterday,     time:'09:00', driverId:'e7',  driverName:'Karan Joshi',    passengers:['Ananya Rao','Ravi Pillai','Rohit Agarwal'],     routeId:'rt4', routeName:'West End → Innovation Center', status:'completed', distance:10.3, seats:5 },
  { id:'ride7',  date:tomorrow,      time:'08:30', driverId:'e9',  driverName:'Deepak Kumar',   passengers:['Kavita Shah','Manoj Patil'],                    routeId:'rt2', routeName:'East Side → Tech Park',       status:'scheduled', distance:8.7,  seats:4 },
  { id:'ride8',  date:tomorrow,      time:'08:00', driverId:'e1',  driverName:'Arjun Mehta',    passengers:['Priya Sharma','Nisha Reddy','Sneha Patel'],     routeId:'rt5', routeName:'City Center → Corporate HQ', status:'scheduled', distance:6.2,  seats:5 },
  { id:'ride9',  date:twoDaysAgo,    time:'09:30', driverId:'e5',  driverName:'Vikram Singh',   passengers:['Sunita Das'],                                   routeId:'rt3', routeName:'South Gate → Main Office',    status:'completed', distance:15.1, seats:3 },
  { id:'ride10', date:twoDaysAgo,    time:'08:30', driverId:'e14', driverName:'Kavita Shah',    passengers:['Ravi Pillai','Rohit Agarwal'],                  routeId:'rt1', routeName:'North Campus → HQ',           status:'completed', distance:12.4, seats:4 },
  { id:'ride11', date:threeDaysAgo,  time:'09:00', driverId:'e3',  driverName:'Rahul Gupta',    passengers:['Meera Nair','Pooja Verma','Isha Choudhary'],    routeId:'rt4', routeName:'West End → Innovation Center', status:'completed', distance:10.3, seats:5 },
  { id:'ride12', date:threeDaysAgo,  time:'08:00', driverId:'e19', driverName:'Manoj Patil',    passengers:['Amit Tiwari','Karan Joshi'],                    routeId:'rt5', routeName:'City Center → Corporate HQ', status:'completed', distance:6.2,  seats:4 },
  { id:'ride13', date:threeDaysAgo,  time:'09:00', driverId:'e7',  driverName:'Karan Joshi',    passengers:['Ananya Rao'],                                   routeId:'rt2', routeName:'East Side → Tech Park',       status:'cancelled', distance:8.7,  seats:3 },
  { id:'ride14', date:yesterday,     time:'08:30', driverId:'e13', driverName:'Rohit Agarwal',  passengers:['Divya Menon','Suresh Bose','Nisha Reddy'],      routeId:'rt1', routeName:'North Campus → HQ',           status:'completed', distance:12.4, seats:5 },
  { id:'ride15', date:dayAfter,      time:'08:30', driverId:'e17', driverName:'Ravi Pillai',    passengers:['Meera Nair','Sunita Das'],                      routeId:'rt3', routeName:'South Gate → Main Office',    status:'scheduled', distance:15.1, seats:4 }
];

const DEFAULT_ANALYTICS = {
  co2ByMonth: [
    { month:'Jan', value:28.4 }, { month:'Feb', value:32.1 },
    { month:'Mar', value:29.8 }, { month:'Apr', value:38.5 },
    { month:'May', value:42.3 }, { month:'Jun', value:35.6 }
  ],
  ridesByDept: [
    { dept:'Engineering', rides:312 }, { dept:'Sales', rides:198 },
    { dept:'Operations',  rides:245 }, { dept:'Finance', rides:134 },
    { dept:'HR',          rides:89  }, { dept:'Marketing', rides:167 }
  ],
  driverUtil: [
    { label:'Active Drivers', value:42 },
    { label:'Occasional',     value:28 },
    { label:'Passenger Only', value:30 }
  ],
  monthlyData: [
    { month:'January 2026',  rides:187, drivers:38, co2:28.4, km:2244 },
    { month:'February 2026', rides:212, drivers:41, co2:32.1, km:2544 },
    { month:'March 2026',    rides:198, drivers:39, co2:29.8, km:2376 },
    { month:'April 2026',    rides:254, drivers:45, co2:38.5, km:3048 },
    { month:'May 2026',      rides:279, drivers:48, co2:42.3, km:3348 },
    { month:'June 2026',     rides:235, drivers:42, co2:35.6, km:2820 }
  ]
};

const DEFAULT_SETTINGS = {
  companyName: 'CorpPool Technologies',
  companyEmail: 'admin@corppool.com',
  companyPhone: '+91 22 1234 5678',
  companyAddress: 'Mumbai, Maharashtra, India',
  workStart: '08:00',
  workEnd: '18:00',
  notifications: {
    rideStarted:   true,
    rideCompleted: true,
    newEmployee:   false,
    weeklyReport:  true,
    cancelledRide: true
  }
};

// ==========================================
// DATA STORE (localStorage)
// ==========================================
const DB = {
  get(key) {
    try {
      const d = localStorage.getItem('cp_' + key);
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  },
  set(key, value) {
    localStorage.setItem('cp_' + key, JSON.stringify(value));
  },
  init() {
    if (!this.get('seeded')) {
      this.set('employees', DEFAULT_EMPLOYEES);
      this.set('routes',    DEFAULT_ROUTES);
      this.set('rides',     DEFAULT_RIDES);
      this.set('analytics', DEFAULT_ANALYTICS);
      this.set('settings',  DEFAULT_SETTINGS);
      this.set('seeded', true);
    }
  }
};

// ==========================================
// UTILITIES
// ==========================================
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function avatar(name, size = 38) {
  const fs = Math.floor(size * 0.35);
  return `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${fs}px;background:${getAvatarColor(name)}">${getInitials(name)}</div>`;
}

function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function relativeDate(str) {
  const d = new Date(str + 'T00:00:00');
  const diff = Math.floor((new Date() - d) / 86400000);
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Yesterday';
  if (diff === -1) return 'Tomorrow';
  if (diff < -1)   return `In ${-diff} days`;
  return `${diff} days ago`;
}

function statusBadge(status) {
  const labels = { active:'Active', scheduled:'Scheduled', completed:'Completed', cancelled:'Cancelled' };
  return `<span class="badge ${status}"><span class="badge-dot"></span>${labels[status] || status}</span>`;
}

function roleBadge(role) {
  const labels = { driver:'Driver', passenger:'Passenger', both:'Driver & Passenger' };
  return `<span class="badge ${role}">${labels[role] || role}</span>`;
}

function deptBadge(dept) {
  return `<span class="dept-badge dept-${dept}">${dept}</span>`;
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}

// ==========================================
// TOAST
// ==========================================
function toast(msg, type = 'success') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span style="font-size:18px">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(24px)'; setTimeout(() => t.remove(), 320); }, 3000);
}

// ==========================================
// MODAL HELPERS
// ==========================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ==========================================
// SIDEBAR
// ==========================================
function buildSidebar() {
  const s = DB.get('settings') || DEFAULT_SETTINGS;
  let sessionPhone = '';
  try {
    const sess = JSON.parse(localStorage.getItem('cp_session') || 'null');
    if (sess && sess.phone) sessionPhone = sess.phone;
  } catch {}

  return `
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">🚗</div>
      <div>
        <div class="logo-text">CorpPool</div>
        <div class="logo-tagline">Carpool Tracker</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Main</div>
      <a href="index.html"     class="nav-item"><span class="nav-item-icon">📊</span> Dashboard</a>
      <a href="rides.html"     class="nav-item"><span class="nav-item-icon">🚗</span> Rides</a>
      <a href="employees.html" class="nav-item"><span class="nav-item-icon">👥</span> Employees</a>
      <a href="routes.html"    class="nav-item"><span class="nav-item-icon">🗺️</span> Routes</a>
      <div class="nav-section-label">Insights</div>
      <a href="analytics.html" class="nav-item"><span class="nav-item-icon">📈</span> Analytics</a>
      <div class="nav-section-label">Admin</div>
      <a href="settings.html"  class="nav-item"><span class="nav-item-icon">⚙️</span> Settings</a>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar-sm">AD</div>
        <div style="flex:1;min-width:0">
          <div class="user-name">${s.companyName || 'CorpPool'}</div>
          <div class="user-role">${sessionPhone || 'Admin'}</div>
        </div>
      </div>
      <button onclick="logout()" title="Logout" style="width:100%;margin-top:8px;padding:9px;background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.15);border-radius:8px;color:#f87171;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:7px" onmouseover="this.style.background='rgba(244,63,94,0.15)'" onmouseout="this.style.background='rgba(244,63,94,0.08)'">
        🚪 Logout
      </button>
    </div>
  </aside>`;
}

function initNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(el => {
    const href = el.getAttribute('href');
    const isActive = href === page || (page === '' && href === 'index.html');
    el.classList.toggle('active', isActive);
  });
}

// ==========================================
// BOOTSTRAP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  requireAuth(); // 🔒 guard all pages
  DB.init();
  const ph = document.getElementById('sidebar-ph');
  if (ph) ph.innerHTML = buildSidebar();
  initNav();
});
