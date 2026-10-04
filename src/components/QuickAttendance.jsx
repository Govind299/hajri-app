import React, { useState } from "react";
import confetti from "canvas-confetti";
import { translations } from "../translations";
import { formatCurrency } from "../utils/calculations";
import { generateWhatsAppSlip } from "../utils/whatsapp";
import { 
  CheckCheck, 
  MessageCircle, 
  Plus, 
  Search, 
  Clock, 
  UserPlus, 
  Check, 
  Phone
} from "lucide-react";

export default function QuickAttendance({
  lang,
  workers = [],
  sites = [],
  selectedSiteId,
  currentDate,
  attendance = [],
  transactions = [],
  onUpdateAttendance,
  onBulkMarkPresent,
  onOpenAddWorker,
  onOpenKhata
}) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, present, halfDay, absent, unmarked

  // Filter workers based on site and active status
  const siteWorkers = workers.filter(
    (w) => (selectedSiteId === "all" ? true : w.siteId === selectedSiteId) && w.isActive
  );

  // Map attendance records for current date
  const getRecord = (workerId) => {
    return attendance.find((a) => a.workerId === workerId && a.date === currentDate);
  };

  // Status cycle: Unmarked -> Present -> HalfDay -> Absent -> Present
  const handleCycleStatus = (workerId) => {
    const existing = getRecord(workerId);
    let nextStatus = "present";

    if (!existing) {
      nextStatus = "present";
    } else if (existing.status === "present") {
      nextStatus = "halfDay";
    } else if (existing.status === "halfDay") {
      nextStatus = "absent";
    } else if (existing.status === "absent") {
      nextStatus = "present";
    }

    onUpdateAttendance(workerId, {
      status: nextStatus,
      otHours: existing ? existing.otHours : 0
    });
  };

  // Set explicit status
  const handleSetStatus = (workerId, newStatus) => {
    const existing = getRecord(workerId);
    onUpdateAttendance(workerId, {
      status: newStatus,
      otHours: existing ? existing.otHours : 0
    });
  };

  // Overtime adjustments (+1h, +2h, reset)
  const handleAddOt = (workerId, hoursToAdd) => {
    const existing = getRecord(workerId);
    const currentOt = existing?.otHours || 0;
    const newOt = Math.max(0, currentOt + hoursToAdd);

    onUpdateAttendance(workerId, {
      status: existing?.status || "present",
      otHours: newOt
    });
  };

  const handleClearOt = (workerId) => {
    const existing = getRecord(workerId);
    onUpdateAttendance(workerId, {
      status: existing?.status || "present",
      otHours: 0
    });
  };

  // Bulk mark present with confetti
  const handleBulkPresentClick = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    onBulkMarkPresent(siteWorkers.map((w) => w.id));
  };

  // WhatsApp click handler
  const handleWhatsAppClick = (worker) => {
    const site = sites.find((s) => s.id === worker.siteId);
    const { url } = generateWhatsAppSlip({
      worker,
      site,
      attendance,
      transactions,
      lang
    });
    window.open(url, "_blank");
  };

  // Apply search & status filter
  const filteredWorkers = siteWorkers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.phone && worker.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    const rec = getRecord(worker.id);
    const status = rec ? rec.status : "unmarked";

    if (statusFilter === "all") return true;
    if (statusFilter === "unmarked") return !rec;
    return status === statusFilter;
  });

  return (
    <div className="hajri-screen">
      {/* Top Action Bar: Bulk Button + Search */}
      <div className="hajri-action-bar">
        <button
          type="button"
          className="btn-bulk-present"
          onClick={handleBulkPresentClick}
        >
          <CheckCheck size={20} className="bulk-icon" />
          <span className="bulk-text">{t.markAllPresent}</span>
        </button>

        <button
          type="button"
          className="btn-add-worker-header"
          onClick={onOpenAddWorker}
        >
          <UserPlus size={18} />
          <span>{t.actions.addWorker}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-search-container">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={t.actions.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="filter-pills-row">
          <button
            type="button"
            className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            {t.actions.filterAll} ({siteWorkers.length})
          </button>
          <button
            type="button"
            className={`filter-pill pill-present ${statusFilter === "present" ? "active" : ""}`}
            onClick={() => setStatusFilter("present")}
          >
            🟢 {t.status.present}
          </button>
          <button
            type="button"
            className={`filter-pill pill-halfday ${statusFilter === "halfDay" ? "active" : ""}`}
            onClick={() => setStatusFilter("halfDay")}
          >
            🟡 {t.status.halfDay}
          </button>
          <button
            type="button"
            className={`filter-pill pill-absent ${statusFilter === "absent" ? "active" : ""}`}
            onClick={() => setStatusFilter("absent")}
          >
            🔴 {t.status.absent}
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "unmarked" ? "active" : ""}`}
            onClick={() => setStatusFilter("unmarked")}
          >
            ⚪ Unmarked
          </button>
        </div>
      </div>

      {/* Worker Hajri Cards Grid */}
      <div className="workers-hajri-list">
        {filteredWorkers.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrap">👷‍♂️</div>
            <h3>No workers found</h3>
            <p>Try searching another name or add a new worker to this site.</p>
            <button
              type="button"
              className="btn-primary mt-3"
              onClick={onOpenAddWorker}
            >
              <Plus size={18} /> {t.actions.addWorker}
            </button>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const rec = getRecord(worker.id);
            const status = rec ? rec.status : null; // null = unmarked
            const otHours = rec ? rec.otHours : 0;
            const tradeLabel = t.trades[worker.trade] || worker.trade;
            const siteObj = sites.find((s) => s.id === worker.siteId);

            return (
              <div
                key={worker.id}
                className={`worker-hajri-card card-status-${status || "unmarked"}`}
              >
                {/* Worker Identity Header */}
                <div className="worker-card-top">
                  <div className="worker-avatar" style={{ backgroundColor: worker.avatarColor || "#10b981" }}>
                    {worker.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="worker-details">
                    <div className="worker-name-row">
                      <h3 className="worker-name">{worker.name}</h3>
                      <span className="worker-rate-badge">
                        {formatCurrency(worker.rate)}/day
                      </span>
                    </div>

                    <div className="worker-meta-row">
                      <span className="worker-trade-tag">{tradeLabel}</span>
                      {worker.phone && (
                        <a href={`tel:${worker.phone}`} className="worker-phone-link">
                          <Phone size={12} /> {worker.phone}
                        </a>
                      )}
                      {selectedSiteId === "all" && siteObj && (
                        <span className="worker-site-tag">🏗️ {siteObj.name}</span>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Quick Slip Action */}
                  <button
                    type="button"
                    className="btn-whatsapp-quick"
                    onClick={() => handleWhatsAppClick(worker)}
                    title="Send WhatsApp Hajri Slip"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>

                {/* Big 1-Tap Attendance Buttons */}
                <div className="attendance-buttons-row">
                  <button
                    type="button"
                    className={`status-btn btn-present ${status === "present" ? "active" : ""}`}
                    onClick={() => handleSetStatus(worker.id, "present")}
                  >
                    <span className="status-symbol">P</span>
                    <span className="status-text">{t.status.present}</span>
                    {status === "present" && <Check size={16} className="status-check" />}
                  </button>

                  <button
                    type="button"
                    className={`status-btn btn-halfday ${status === "halfDay" ? "active" : ""}`}
                    onClick={() => handleSetStatus(worker.id, "halfDay")}
                  >
                    <span className="status-symbol">HD</span>
                    <span className="status-text">{t.status.halfDay}</span>
                    {status === "halfDay" && <Check size={16} className="status-check" />}
                  </button>

                  <button
                    type="button"
                    className={`status-btn btn-absent ${status === "absent" ? "active" : ""}`}
                    onClick={() => handleSetStatus(worker.id, "absent")}
                  >
                    <span className="status-symbol">A</span>
                    <span className="status-text">{t.status.absent}</span>
                    {status === "absent" && <Check size={16} className="status-check" />}
                  </button>
                </div>

                {/* Overtime (OT) Controls Row */}
                <div className="ot-controls-strip">
                  <div className="ot-label-group">
                    <Clock size={15} className="ot-clock-icon" />
                    <span className="ot-title">{t.actions.overtimeHours}:</span>
                    <span className={`ot-count-badge ${otHours > 0 ? "has-ot" : ""}`}>
                      {otHours}h
                    </span>
                  </div>

                  <div className="ot-stepper-buttons">
                    <button
                      type="button"
                      className="ot-add-btn"
                      onClick={() => handleAddOt(worker.id, 1)}
                    >
                      {t.actions.addOneHour}
                    </button>
                    <button
                      type="button"
                      className="ot-add-btn"
                      onClick={() => handleAddOt(worker.id, 2)}
                    >
                      {t.actions.addTwoHours}
                    </button>
                    {otHours > 0 && (
                      <button
                        type="button"
                        className="ot-clear-btn"
                        onClick={() => handleClearOt(worker.id)}
                        title="Clear OT"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-view-khata-mini"
                    onClick={() => onOpenKhata(worker)}
                  >
                    {t.tabs.khata} →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
