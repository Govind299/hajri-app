import React, { useState } from "react";
import { translations } from "../translations";
import { calculateWorkerFinancials, formatCurrency } from "../utils/calculations";
import { generateMonthlyMusterPdf } from "../utils/pdfGenerator";
import { generateWhatsAppSlip } from "../utils/whatsapp";
import { 
  Download, 
  MessageCircle, 
  Calendar, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  IndianRupee 
} from "lucide-react";

export default function MonthlyReport({
  lang,
  workers = [],
  sites = [],
  selectedSiteId,
  attendance = [],
  transactions = []
}) {
  const t = translations[lang];

  // Month selector (Default to current Year-Month)
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const siteWorkers = workers.filter(
    (w) => (selectedSiteId === "all" ? true : w.siteId === selectedSiteId) && w.isActive
  );
  const currentSite = sites.find((s) => s.id === selectedSiteId);

  // Filter attendance to selected month
  const monthAttendance = attendance.filter((a) => a.date && a.date.startsWith(selectedMonth));

  // Download PDF Handler
  const handleDownloadPdf = () => {
    generateMonthlyMusterPdf({
      workers: siteWorkers,
      site: currentSite,
      attendance: monthAttendance,
      transactions,
      monthStr: selectedMonth
    });
  };

  // WhatsApp Slip Handler
  const handleWhatsApp = (worker) => {
    const site = sites.find((s) => s.id === worker.siteId);
    const { url } = generateWhatsAppSlip({
      worker,
      site,
      attendance: monthAttendance,
      transactions,
      lang
    });
    window.open(url, "_blank");
  };

  // Total sums
  let totalSiteEarned = 0;
  let totalSiteAdvance = 0;
  let totalSiteBalance = 0;

  siteWorkers.forEach((w) => {
    const fin = calculateWorkerFinancials(w, monthAttendance, transactions);
    totalSiteEarned += fin.totalEarned;
    totalSiteAdvance += fin.totalAdvance;
    totalSiteBalance += fin.balanceDue;
  });

  return (
    <div className="monthly-report-screen">
      {/* Top Controls: Month Picker & PDF Download */}
      <div className="report-header-card">
        <div className="month-picker-group">
          <Calendar size={20} className="report-icon" />
          <label className="month-label">Month:</label>
          <input
            type="month"
            className="month-input"
            value={selectedMonth}
            onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-download-pdf"
          onClick={handleDownloadPdf}
        >
          <Download size={18} />
          <span>{t.actions.downloadPdf}</span>
        </button>
      </div>

      {/* Summary Ribbon */}
      <div className="report-summary-bar">
        <div className="summary-stat-box">
          <span className="stat-label">{t.khata.totalEarned}</span>
          <span className="stat-value text-emerald">
            {formatCurrency(totalSiteEarned)}
          </span>
        </div>
        <div className="summary-stat-box">
          <span className="stat-label">{t.khata.advancesGiven}</span>
          <span className="stat-value text-amber">
            {formatCurrency(totalSiteAdvance)}
          </span>
        </div>
        <div className="summary-stat-box">
          <span className="stat-label">{t.khata.balanceDue}</span>
          <span className="stat-value text-red bold">
            {formatCurrency(totalSiteBalance)}
          </span>
        </div>
      </div>

      {/* Responsive Table / Cards Grid */}
      <div className="report-table-wrapper">
        <table className="muster-table">
          <thead>
            <tr>
              <th>{t.whatsapp.worker}</th>
              <th>{t.status.presentShort} / {t.status.halfDayShort} / {t.status.absentShort}</th>
              <th>OT (h)</th>
              <th>{t.khata.totalEarned}</th>
              <th>{t.khata.advancesGiven}</th>
              <th>{t.khata.balanceDue}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {siteWorkers.map((worker) => {
              const fin = calculateWorkerFinancials(worker, monthAttendance, transactions);
              const tradeLabel = t.trades[worker.trade] || worker.trade;

              return (
                <tr key={worker.id}>
                  <td>
                    <div className="table-worker-cell">
                      <strong>{worker.name}</strong>
                      <span className="table-trade-badge">{tradeLabel} (₹{worker.rate}/d)</span>
                    </div>
                  </td>
                  <td>
                    <div className="attendance-pills-cell">
                      <span className="pill-badge pill-p">{fin.presentCount}P</span>
                      <span className="pill-badge pill-hd">{fin.halfDayCount}HD</span>
                      <span className="pill-badge pill-a">{fin.absentCount}A</span>
                    </div>
                  </td>
                  <td>{fin.totalOtHours}h</td>
                  <td className="text-emerald bold">{formatCurrency(fin.totalEarned)}</td>
                  <td className="text-amber">{formatCurrency(fin.totalAdvance)}</td>
                  <td className="text-red bold">{formatCurrency(fin.balanceDue)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-table-wa"
                      onClick={() => handleWhatsApp(worker)}
                      title="Send WhatsApp Slip"
                    >
                      <MessageCircle size={16} />
                      <span>{t.actions.shareWhatsApp}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
