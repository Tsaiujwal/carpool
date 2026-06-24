// js/db.js — Firestore-backed data layer (replaces localStorage)
// Maintains a local cache for synchronous reads + async Firestore writes

// ──────────────────────────────────────────────────────────────
// SEED DATA — used when a new company registers
// ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#6366f1','#10b981','#f59e0b','#f43f5e','#0ea5e9',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16'
];

const _today        = new Date().toISOString().split('T')[0];
const _yesterday    = new Date(Date.now()-86400000).toISOString().split('T')[0];
const _twoDaysAgo   = new Date(Date.now()-2*86400000).toISOString().split('T')[0];
const _threeDaysAgo = new Date(Date.now()-3*86400000).toISOString().split('T')[0];
const _tomorrow     = new Date(Date.now()+86400000).toISOString().split('T')[0];
const _dayAfter     = new Date(Date.now()+2*86400000).toISOString().split('T')[0];

const DEFAULT_EMPLOYEES = [
  { id:'e1',  name:'Arjun Mehta',    email:'arjun@corppool.com',   department:'Engineering', role:'driver',    totalRides:48, co2Saved:24.5, joinDate:'2023-03-15', phone:'+91 98765 43210' },
  { id:'e2',  name:'Priya Sharma',   email:'priya@corppool.com',   department:'Sales',       role:'passenger', totalRides:32, co2Saved:16.2, joinDate:'2023-01-20', phone:'+91 98765 43211' },
  { id:'e3',  name:'Rahul Gupta',    email:'rahul@corppool.com',   department:'Engineering', role:'both',      totalRides:55, co2Saved:28.1, joinDate:'2022-11-10', phone:'+91 98765 43212' },
  { id:'e4',  name:'Sneha Patel',    email:'sneha@corppool.com',   department:'HR',          role:'passenger', totalRides:21, co2Saved:10.8, joinDate:'2023-06-01', phone:'+91 98765 43213' },
  { id:'e5',  name:'Vikram Singh',   email:'vikram@corppool.com',  department:'Finance',     role:'driver',    totalRides:61, co2Saved:31.4, joinDate:'2022-08-22', phone:'+91 98765 43214' },
  { id:'e6',  name:'Ananya Rao',     email:'ananya@corppool.com',  department:'Marketing',   role:'both',      totalRides:38, co2Saved:19.3, joinDate:'2023-02-14', phone:'+91 98765 43215' },
  { id:'e7',  name:'Karan Joshi',    email:'karan@corppool.com',   department:'Engineering', role:'driver',    totalRides:44, co2Saved:22.4, joinDate:'2022-12-05', phone:'+91 98765 43216' },
  { id:'e8',  name:'Meera Nair',     email:'meera@corppool.com',   department:'HR',          role:'passenger', totalRides:19, co2Saved:9.6,  joinDate:'2023-07-11', phone:'+91 98765 43217' },
  { id:'e9',  name:'Deepak Kumar',   email:'deepak@corppool.com',  department:'Operations',  role:'driver',    totalRides:52, co2Saved:26.6, joinDate:'2022-10-30', phone:'+91 98765 43218' },
  { id:'e10', name:'Nisha Reddy',    email:'nisha@corppool.com',   department:'Sales',       role:'passenger', totalRides:28, co2Saved:14.2, joinDate:'2023-04-18', phone:'+91 98765 43219' },
  { id:'e11', name:'Amit Tiwari',    email:'amit@corppool.com',    department:'Finance',     role:'both',      totalRides:33, co2Saved:17.0, joinDate:'2023-01-08', phone:'+91 98765 43220' },
  { id:'e12', name:'Pooja Verma',    email:'pooja@corppool.com',   department:'Marketing',   role:'passenger', totalRides:15, co2Saved:7.8,  joinDate:'2023-08-01', phone:'+91 98765 43221' },
  { id:'e13', name:'Rohit Agarwal',  email:'rohit@corppool.com',   department:'Engineering', role:'driver',    totalRides:57, co2Saved:29.0, joinDate:'2022-09-15', phone:'+91 98765 43222' },
  { id:'e14', name:'Kavita Shah',    email:'kavita@corppool.com',  department:'Operations',  role:'both',      totalRides:41, co2Saved:20.9, joinDate:'2022-11-28', phone:'+91 98765 43223' },
  { id:'e15', name:'Suresh Bose',    email:'suresh@corppool.com',  department:'Sales',       role:'driver',    totalRides:36, co2Saved:18.4, joinDate:'2023-03-03', phone:'+91 98765 43224' },
  { id:'e16', name:'Divya Menon',    email:'divya@corppool.com',   department:'HR',          role:'passenger', totalRides:23, co2Saved:11.7, joinDate:'2023-05-20', phone:'+91 98765 43225' },
  { id:'e17', name:'Ravi Pillai',    email:'ravi@corppool.com',    department:'Engineering', role:'both',      totalRides:49, co2Saved:25.0, joinDate:'2022-07-17', phone:'+91 98765 43226' },
  { id:'e18', name:'Sunita Das',     email:'sunita@corppool.com',  department:'Finance',     role:'passenger', totalRides:17, co2Saved:8.7,  joinDate:'2023-09-10', phone:'+91 98765 43227' },
  { id:'e19', name:'Manoj Patil',    email:'manoj@corppool.com',   department:'Operations',  role:'driver',    totalRides:63, co2Saved:32.2, joinDate:'2022-06-01', phone:'+91 98765 43228' },
  { id:'e20', name:'Isha Choudhary', email:'isha@corppool.com',    department:'Marketing',   role:'passenger', totalRides:26, co2Saved:13.3, joinDate:'2023-04-25', phone:'+91 98765 43229' }
];

const DEFAULT_ROUTES = [
  { id:'rt1', name:'North Campus → HQ',           from:'North Campus',  to:'HQ Tower',          distance:12.4, duration:28, activeRides:5, totalRides:124 },
  { id:'rt2', name:'East Side → Tech Park',        from:'East Side Hub', to:'Tech Park',         distance:8.7,  duration:22, activeRides:3, totalRides:89  },
  { id:'rt3', name:'South Gate → Main Office',     from:'South Gate',    to:'Main Office',       distance:15.1, duration:35, activeRides:4, totalRides:156 },
  { id:'rt4', name:'West End → Innovation Center', from:'West End',      to:'Innovation Center', distance:10.3, duration:25, activeRides:2, totalRides:67  },
  { id:'rt5', name:'City Center → Corporate HQ',   from:'City Center',   to:'Corporate HQ',      distance:6.2,  duration:18, activeRides:6, totalRides:203 }
];

const DEFAULT_RIDES = [
  { id:'ride1',  date:_today,        time:'08:30', driverId:'e1',  driverName:'Arjun Mehta',   passengers:['Priya Sharma','Meera Nair'],               routeId:'rt1', routeName:'North Campus → HQ',           status:'active',    distance:12.4, seats:4 },
  { id:'ride2',  date:_today,        time:'09:00', driverId:'e5',  driverName:'Vikram Singh',  passengers:['Nisha Reddy','Pooja Verma','Sunita Das'],  routeId:'rt3', routeName:'South Gate → Main Office',    status:'active',    distance:15.1, seats:5 },
  { id:'ride3',  date:_today,        time:'09:15', driverId:'e3',  driverName:'Rahul Gupta',   passengers:['Sneha Patel'],                            routeId:'rt2', routeName:'East Side → Tech Park',       status:'scheduled', distance:8.7,  seats:3 },
  { id:'ride4',  date:_today,        time:'08:00', driverId:'e19', driverName:'Manoj Patil',   passengers:['Isha Choudhary','Divya Menon'],            routeId:'rt5', routeName:'City Center → Corporate HQ', status:'completed', distance:6.2,  seats:4 },
  { id:'ride5',  date:_yesterday,    time:'08:30', driverId:'e13', driverName:'Rohit Agarwal', passengers:['Amit Tiwari','Suresh Bose'],               routeId:'rt1', routeName:'North Campus → HQ',           status:'completed', distance:12.4, seats:4 },
  { id:'ride6',  date:_yesterday,    time:'09:00', driverId:'e7',  driverName:'Karan Joshi',   passengers:['Ananya Rao','Ravi Pillai'],                routeId:'rt4', routeName:'West End → Innovation Center', status:'completed', distance:10.3, seats:5 },
  { id:'ride7',  date:_tomorrow,     time:'08:30', driverId:'e9',  driverName:'Deepak Kumar',  passengers:['Kavita Shah','Manoj Patil'],               routeId:'rt2', routeName:'East Side → Tech Park',       status:'scheduled', distance:8.7,  seats:4 },
  { id:'ride8',  date:_tomorrow,     time:'08:00', driverId:'e1',  driverName:'Arjun Mehta',   passengers:['Priya Sharma','Nisha Reddy','Sneha Patel'],routeId:'rt5', routeName:'City Center → Corporate HQ', status:'scheduled', distance:6.2,  seats:5 },
  { id:'ride9',  date:_twoDaysAgo,   time:'09:30', driverId:'e5',  driverName:'Vikram Singh',  passengers:['Sunita Das'],                             routeId:'rt3', routeName:'South Gate → Main Office',    status:'completed', distance:15.1, seats:3 },
  { id:'ride10', date:_twoDaysAgo,   time:'08:30', driverId:'e14', driverName:'Kavita Shah',   passengers:['Ravi Pillai','Rohit Agarwal'],             routeId:'rt1', routeName:'North Campus → HQ',           status:'completed', distance:12.4, seats:4 },
  { id:'ride11', date:_threeDaysAgo, time:'09:00', driverId:'e3',  driverName:'Rahul Gupta',   passengers:['Meera Nair','Pooja Verma'],                routeId:'rt4', routeName:'West End → Innovation Center', status:'completed', distance:10.3, seats:5 },
  { id:'ride12', date:_threeDaysAgo, time:'08:00', driverId:'e19', driverName:'Manoj Patil',   passengers:['Amit Tiwari','Karan Joshi'],               routeId:'rt5', routeName:'City Center → Corporate HQ', status:'completed', distance:6.2,  seats:4 },
  { id:'ride13', date:_threeDaysAgo, time:'09:00', driverId:'e7',  driverName:'Karan Joshi',   passengers:['Ananya Rao'],                             routeId:'rt2', routeName:'East Side → Tech Park',       status:'cancelled', distance:8.7,  seats:3 },
  { id:'ride14', date:_yesterday,    time:'08:30', driverId:'e13', driverName:'Rohit Agarwal', passengers:['Divya Menon','Suresh Bose','Nisha Reddy'], routeId:'rt1', routeName:'North Campus → HQ',           status:'completed', distance:12.4, seats:5 },
  { id:'ride15', date:_dayAfter,     time:'08:30', driverId:'e17', driverName:'Ravi Pillai',   passengers:['Meera Nair','Sunita Das'],                 routeId:'rt3', routeName:'South Gate → Main Office',    status:'scheduled', distance:15.1, seats:4 }
];

const DEFAULT_ANALYTICS = {
  co2ByMonth:  [
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

// ──────────────────────────────────────────────────────────────
// FS — Firestore-backed data layer with local cache
// Drop-in replacement for the old localStorage DB object
// ──────────────────────────────────────────────────────────────
const FS = {
  _cache:  {},
  _uid:    null,

  // ── Init: load all company data into cache ────────────────
  async init(uid) {
    this._uid = uid;

    // Load company profile + settings
    const compDoc = await db.collection('companies').doc(uid).get();
    this._cache.settings = compDoc.exists ? compDoc.data() : {};

    // Load collections in parallel
    const [emps, rides, routes, analyticsSnap] = await Promise.all([
      db.collection('companies').doc(uid).collection('employees').get(),
      db.collection('companies').doc(uid).collection('rides').get(),
      db.collection('companies').doc(uid).collection('routes').get(),
      db.collection('companies').doc(uid).collection('analytics').doc('main').get()
    ]);

    this._cache.employees = emps.docs.map(d => ({ id: d.id, ...d.data() }));
    this._cache.rides     = rides.docs.map(d => ({ id: d.id, ...d.data() }));
    this._cache.routes    = routes.docs.map(d => ({ id: d.id, ...d.data() }));
    this._cache.analytics = analyticsSnap.exists ? analyticsSnap.data() : DEFAULT_ANALYTICS;
  },

  // ── Synchronous get from cache (backward-compat) ──────────
  get(key) { return this._cache[key] ?? null; },

  // ── Async set (cache + Firestore) ─────────────────────────
  async set(key, value) {
    this._cache[key] = value;
    if (key === 'settings') {
      await db.collection('companies').doc(this._uid).set(value, { merge: true });
    } else if (['employees','rides','routes'].includes(key)) {
      const batch = db.batch();
      const col   = db.collection('companies').doc(this._uid).collection(key);
      value.forEach(item => batch.set(col.doc(item.id), item));
      await batch.commit();
    } else if (key === 'analytics') {
      await db.collection('companies').doc(this._uid).collection('analytics').doc('main').set(value);
    }
  },

  // ── Single-item helpers ────────────────────────────────────
  async addItem(col, item) {
    if (!this._cache[col]) this._cache[col] = [];
    this._cache[col].unshift(item);
    await db.collection('companies').doc(this._uid).collection(col).doc(item.id).set(item);
  },

  async updateItem(col, id, updates) {
    this._cache[col] = (this._cache[col] || []).map(i => i.id === id ? { ...i, ...updates } : i);
    await db.collection('companies').doc(this._uid).collection(col).doc(id).update(updates);
  },

  async deleteItem(col, id) {
    this._cache[col] = (this._cache[col] || []).filter(i => i.id !== id);
    await db.collection('companies').doc(this._uid).collection(col).doc(id).delete();
  },

  // ── Seed data for a brand-new company ─────────────────────
  async seed(companyData) {
    const uid = this._uid;

    // 1. Save company profile
    await db.collection('companies').doc(uid).set({
      ...companyData,
      workStart: '08:00',
      workEnd:   '18:00',
      notifications: {
        rideStarted: true, rideCompleted: true,
        cancelledRide: true, newEmployee: false, weeklyReport: true
      },
      plan: 'free',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 2. Batch write seed collections (max 500 ops per batch)
    const allItems = [
      ...DEFAULT_EMPLOYEES.map(e => ({ col: 'employees', item: e })),
      ...DEFAULT_ROUTES.map(r    => ({ col: 'routes',    item: r })),
      ...DEFAULT_RIDES.map(r     => ({ col: 'rides',     item: r }))
    ];

    let batch = db.batch(); let count = 0; const commits = [];
    for (const { col, item } of allItems) {
      const ref = db.collection('companies').doc(uid).collection(col).doc(item.id);
      batch.set(ref, item);
      if (++count === 490) { commits.push(batch.commit()); batch = db.batch(); count = 0; }
    }

    // Analytics doc
    const aRef = db.collection('companies').doc(uid).collection('analytics').doc('main');
    batch.set(aRef, DEFAULT_ANALYTICS);
    commits.push(batch.commit());
    await Promise.all(commits);

    // 3. Load into cache
    await this.init(uid);
  },

  // ── Check if company profile exists ───────────────────────
  async companyExists(uid) {
    const doc = await db.collection('companies').doc(uid).get();
    return doc.exists;
  }
};

// Backward-compatible alias so existing pages work unchanged
const DB = FS;
