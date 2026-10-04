// Preloaded realistic initial data for immediate out-of-the-box demonstration
export const initialSites = [
  { id: "site-1", name: "साईं रेजीडेंसी (Sai Residency)", location: "सेक्टर 14, रिंग रोड", status: "active" },
  { id: "site-2", name: "गोपाल आर्केड (Gopal Arcade)", location: "मेन मार्केट, स्टेशन रोड", status: "active" }
];

export const initialWorkers = [
  {
    id: "w-1",
    name: "रमेश कुमार (Ramesh Mistri)",
    phone: "9876543210",
    trade: "mistri",
    wageType: "daily",
    rate: 850,
    hourlyOtRate: 110,
    siteId: "site-1",
    isActive: true,
    avatarColor: "#10b981"
  },
  {
    id: "w-2",
    name: "कालू राम (Kalu Ram Majdur)",
    phone: "9823456789",
    trade: "majdur",
    wageType: "daily",
    rate: 550,
    hourlyOtRate: 70,
    siteId: "site-1",
    isActive: true,
    avatarColor: "#f59e0b"
  },
  {
    id: "w-3",
    name: "सुरेश पटेल (Suresh Carpenter)",
    phone: "9812345678",
    trade: "carpenter",
    wageType: "daily",
    rate: 900,
    hourlyOtRate: 120,
    siteId: "site-1",
    isActive: true,
    avatarColor: "#6366f1"
  },
  {
    id: "w-4",
    name: "दिनेश यादव (Dinesh Plumber)",
    phone: "9988776655",
    trade: "plumber",
    wageType: "daily",
    rate: 800,
    hourlyOtRate: 100,
    siteId: "site-1",
    isActive: true,
    avatarColor: "#06b6d4"
  },
  {
    id: "w-5",
    name: "मोहन सिंह (Mohan Helper)",
    phone: "9123456780",
    trade: "majdur",
    wageType: "daily",
    rate: 550,
    hourlyOtRate: 70,
    siteId: "site-2",
    isActive: true,
    avatarColor: "#ec4899"
  }
];

// Helper to get formatted date string YYYY-MM-DD
export const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getPastDateStr = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const initialAttendance = [
  {
    id: "att-1",
    workerId: "w-1",
    date: getTodayStr(),
    status: "present", // present, halfDay, absent
    otHours: 1,
    siteId: "site-1"
  },
  {
    id: "att-2",
    workerId: "w-2",
    date: getTodayStr(),
    status: "present",
    otHours: 0,
    siteId: "site-1"
  },
  {
    id: "att-3",
    workerId: "w-3",
    date: getTodayStr(),
    status: "halfDay",
    otHours: 0,
    siteId: "site-1"
  },
  {
    id: "att-4",
    workerId: "w-4",
    date: getTodayStr(),
    status: "absent",
    otHours: 0,
    siteId: "site-1"
  },
  // Yesterday's records
  {
    id: "att-5",
    workerId: "w-1",
    date: getPastDateStr(1),
    status: "present",
    otHours: 2,
    siteId: "site-1"
  },
  {
    id: "att-6",
    workerId: "w-2",
    date: getPastDateStr(1),
    status: "present",
    otHours: 0,
    siteId: "site-1"
  },
  {
    id: "att-7",
    workerId: "w-3",
    date: getPastDateStr(1),
    status: "present",
    otHours: 1,
    siteId: "site-1"
  }
];

export const initialTransactions = [
  {
    id: "tx-1",
    workerId: "w-1",
    type: "advance", // 'advance' (kharcha given) or 'settlement' (hisaab chukta)
    amount: 500,
    date: getPastDateStr(2),
    paymentMode: "cash",
    category: "राशन / खाना",
    note: "Grocery advance"
  },
  {
    id: "tx-2",
    workerId: "w-2",
    type: "advance",
    amount: 300,
    date: getPastDateStr(1),
    paymentMode: "upi",
    category: "दवा / बीमारी",
    note: "Medicine"
  }
];
