import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import QuickAttendance from "./components/QuickAttendance";
import KhataLedger from "./components/KhataLedger";
import WorkerDirectory from "./components/WorkerDirectory";
import MonthlyReport from "./components/MonthlyReport";
import SiteModal from "./components/SiteModal";

import { translations } from "./translations";
import { getTodayStr } from "./initialData";
import { getSiteMetrics } from "./utils/calculations";
import { 
  loadStoredData, 
  saveToStorage, 
  setStoredLanguage 
} from "./utils/storage";

import { 
  CalendarCheck, 
  Wallet, 
  Users, 
  FileSpreadsheet, 
  Sparkles 
} from "lucide-react";

export default function App() {
  // Load persisted data
  const initialData = loadStoredData();

  const [lang, setLangState] = useState(initialData.lang || "hi");
  const [sites, setSites] = useState(initialData.sites || []);
  const [selectedSiteId, setSelectedSiteId] = useState(initialData.selectedSite || "site-1");
  const [workers, setWorkers] = useState(initialData.workers || []);
  const [attendance, setAttendance] = useState(initialData.attendance || []);
  const [transactions, setTransactions] = useState(initialData.transactions || []);
  const [currentDate, setCurrentDate] = useState(getTodayStr());

  // Navigation tab: 'attendance', 'khata', 'workers', 'monthly'
  const [activeTab, setActiveTab] = useState("attendance");

  // Modals
  const [isOpenAddWorker, setIsOpenAddWorker] = useState(false);
  const [isOpenNewSite, setIsOpenNewSite] = useState(false);
  const [selectedWorkerForKhata, setSelectedWorkerForKhata] = useState(null);

  // Toast / notification
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  const handleSetLang = (newLang) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  // Sync to localStorage
  useEffect(() => {
    saveToStorage("sites", sites);
  }, [sites]);

  useEffect(() => {
    saveToStorage("workers", workers);
  }, [workers]);

  useEffect(() => {
    saveToStorage("attendance", attendance);
  }, [attendance]);

  useEffect(() => {
    saveToStorage("transactions", transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage("selected_site", selectedSiteId);
  }, [selectedSiteId]);

  // Attendance update logic
  const handleUpdateAttendance = (workerId, { status, otHours = 0 }) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.workerId === workerId && a.date === currentDate)
      );

      const worker = workers.find((w) => w.id === workerId);
      const newRecord = {
        id: `att-${Date.now()}-${workerId}`,
        workerId,
        date: currentDate,
        status,
        otHours,
        siteId: worker?.siteId || selectedSiteId
      };

      return [...filtered, newRecord];
    });
  };

  // 1-Tap Bulk Mark Present
  const handleBulkMarkPresent = (workerIds = []) => {
    setAttendance((prev) => {
      // Remove any existing records for these workers on current date
      const idSet = new Set(workerIds);
      const filtered = prev.filter(
        (a) => !(idSet.has(a.workerId) && a.date === currentDate)
      );

      const newRecords = workerIds.map((workerId) => {
        const worker = workers.find((w) => w.id === workerId);
        return {
          id: `att-${Date.now()}-${workerId}`,
          workerId,
          date: currentDate,
          status: "present",
          otHours: 0,
          siteId: worker?.siteId || selectedSiteId
        };
      });

      return [...filtered, ...newRecords];
    });

    showToast(translations[lang].allPresentSuccess);
  };

  // Worker Save
  const handleSaveWorker = (workerObj) => {
    setWorkers((prev) => {
      const idx = prev.findIndex((w) => w.id === workerObj.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = workerObj;
        return copy;
      } else {
        return [...prev, workerObj];
      }
    });
    showToast("Worker details saved successfully!");
  };

  // Worker Delete
  const handleDeleteWorker = (workerId) => {
    if (window.confirm("Are you sure you want to remove this worker?")) {
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      showToast("Worker removed.");
    }
  };

  // Transaction Add (Advance / Settle)
  const handleAddTransaction = (txObj) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      ...txObj
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      txObj.type === "advance"
        ? `₹${txObj.amount} Advance / Kharcha recorded!`
        : `₹${txObj.amount} Hisaab settled successfully!`
    );
  };

  // Site Add
  const handleSaveSite = (newSite) => {
    setSites((prev) => [...prev, newSite]);
    setSelectedSiteId(newSite.id);
    showToast(`Site "${newSite.name}" created!`);
  };

  // Jump from Hajri card to Khata
  const handleOpenKhataForWorker = (worker) => {
    setSelectedWorkerForKhata(worker);
    setActiveTab("khata");
  };

  // Site metrics calculation
  const siteMetrics = getSiteMetrics(
    workers,
    attendance,
    transactions,
    currentDate,
    selectedSiteId
  );

  const t = translations[lang];

  return (
    <div className="app-container">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="app-toast">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        lang={lang}
        setLang={handleSetLang}
        sites={sites}
        selectedSiteId={selectedSiteId}
        setSelectedSiteId={setSelectedSiteId}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        siteMetrics={siteMetrics}
        onOpenNewSite={() => setIsOpenNewSite(true)}
      />

      {/* Main Tab Content Area */}
      <main className="main-content">
        {activeTab === "attendance" && (
          <QuickAttendance
            lang={lang}
            workers={workers}
            sites={sites}
            selectedSiteId={selectedSiteId}
            currentDate={currentDate}
            attendance={attendance}
            transactions={transactions}
            onUpdateAttendance={handleUpdateAttendance}
            onBulkMarkPresent={handleBulkMarkPresent}
            onOpenAddWorker={() => setIsOpenAddWorker(true)}
            onOpenKhata={handleOpenKhataForWorker}
          />
        )}

        {activeTab === "khata" && (
          <KhataLedger
            lang={lang}
            workers={workers}
            sites={sites}
            selectedSiteId={selectedSiteId}
            attendance={attendance}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            selectedWorkerForKhata={selectedWorkerForKhata}
          />
        )}

        {activeTab === "workers" && (
          <WorkerDirectory
            lang={lang}
            workers={workers}
            sites={sites}
            selectedSiteId={selectedSiteId}
            onSaveWorker={handleSaveWorker}
            onDeleteWorker={handleDeleteWorker}
            isOpenAddModal={isOpenAddWorker}
            onCloseAddModal={() => setIsOpenAddWorker(false)}
          />
        )}

        {activeTab === "monthly" && (
          <MonthlyReport
            lang={lang}
            workers={workers}
            sites={sites}
            selectedSiteId={selectedSiteId}
            attendance={attendance}
            transactions={transactions}
          />
        )}
      </main>

      {/* Modern App Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button
          type="button"
          className={`nav-tab ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <CalendarCheck size={22} className="nav-icon" />
          <span className="nav-label">{t.tabs.attendance}</span>
          {siteMetrics.unmarkedCount > 0 && activeTab !== "attendance" && (
            <span className="nav-badge-dot" />
          )}
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === "khata" ? "active" : ""}`}
          onClick={() => {
            setSelectedWorkerForKhata(null);
            setActiveTab("khata");
          }}
        >
          <Wallet size={22} className="nav-icon" />
          <span className="nav-label">{t.tabs.khata}</span>
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === "workers" ? "active" : ""}`}
          onClick={() => setActiveTab("workers")}
        >
          <Users size={22} className="nav-icon" />
          <span className="nav-label">{t.tabs.workers}</span>
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === "monthly" ? "active" : ""}`}
          onClick={() => setActiveTab("monthly")}
        >
          <FileSpreadsheet size={22} className="nav-icon" />
          <span className="nav-label">{t.tabs.monthly}</span>
        </button>
      </nav>

      {/* New Site Modal */}
      <SiteModal
        lang={lang}
        isOpen={isOpenNewSite}
        onClose={() => setIsOpenNewSite(false)}
        onSaveSite={handleSaveSite}
      />
    </div>
  );
}
