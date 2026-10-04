import React, { useState } from "react";
import confetti from "canvas-confetti";
import { translations } from "../translations";
import { calculateWorkerFinancials, formatCurrency } from "../utils/calculations";
import { generateWhatsAppSlip } from "../utils/whatsapp";
import { 
  IndianRupee, 
  PlusCircle, 
  CheckCircle, 
  MessageCircle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  X
} from "lucide-react";

export default function KhataLedger({
  lang,
  workers = [],
  sites = [],
  selectedSiteId,
  attendance = [],
  transactions = [],
  onAddTransaction,
  selectedWorkerForKhata = null
}) {
  const t = translations[lang];

  // Active workers in site
  const siteWorkers = workers.filter(
    (w) => (selectedSiteId === "all" ? true : w.siteId === selectedSiteId) && w.isActive
  );

  // Modal states
  const [activeModalWorker, setActiveModalWorker] = useState(selectedWorkerForKhata);
  const [modalType, setModalType] = useState(null); // 'advance' or 'settlement' or 'history'
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");

  // Open modal helper
  const handleOpenAdvance = (worker) => {
    setActiveModalWorker(worker);
    setModalType("advance");
    setAmount("500"); // default friendly preset
    setReason("राशन / खाना");
    setPaymentMode("cash");
  };

  const handleOpenSettle = (worker) => {
    const fin = calculateWorkerFinancials(worker, attendance, transactions);
    setActiveModalWorker(worker);
    setModalType("settlement");
    setAmount(String(fin.balanceDue || "0"));
    setReason("मजदूरी हिसाब चुकता");
    setPaymentMode("cash");
  };

  const handleOpenHistory = (worker) => {
    setActiveModalWorker(worker);
    setModalType("history");
  };

  const handleCloseModal = () => {
    setActiveModalWorker(null);
    setModalType(null);
    setAmount("");
    setReason("");
  };

  // Submit transaction
  const handleSubmitTx = (e) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) return;

    onAddTransaction({
      workerId: activeModalWorker.id,
      type: modalType,
      amount: numAmt,
      date: new Date().toISOString().split("T")[0],
      paymentMode,
      category: reason || (modalType === "advance" ? "खर्चा" : "हिसाब"),
      note: reason
    });

    if (modalType === "settlement") {
      confetti({ particleCount: 50, spread: 60 });
    }

    handleCloseModal();
  };

  // WhatsApp share
  const handleWhatsApp = (worker) => {
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

  // Compute total site-level balance
  let grandTotalEarned = 0;
  let grandTotalAdvance = 0;
  let grandTotalBalance = 0;

  siteWorkers.forEach((w) => {
    const fin = calculateWorkerFinancials(w, attendance, transactions);
    grandTotalEarned += fin.totalEarned;
    grandTotalAdvance += fin.totalAdvance;
    grandTotalBalance += fin.balanceDue;
  });

  return (
    <div className="khata-screen">
      {/* High-Level Khata Ledger Banner */}
      <div className="khata-summary-banner">
        <div className="khata-banner-col">
          <span className="banner-col-label">{t.khata.totalEarned}</span>
          <span className="banner-col-value text-emerald">
            {formatCurrency(grandTotalEarned)}
          </span>
        </div>

        <div className="khata-banner-divider" />

        <div className="khata-banner-col">
          <span className="banner-col-label">{t.khata.advancesGiven}</span>
          <span className="banner-col-value text-amber">
            {formatCurrency(grandTotalAdvance)}
          </span>
        </div>

        <div className="khata-banner-divider" />

        <div className="khata-banner-col">
          <span className="banner-col-label">{t.khata.balanceDue}</span>
          <span className="banner-col-value text-red bold">
            {formatCurrency(grandTotalBalance)}
          </span>
        </div>
      </div>

      {/* Workers Khata Cards */}
      <div className="khata-workers-grid">
        {siteWorkers.map((worker) => {
          const fin = calculateWorkerFinancials(worker, attendance, transactions);
          const tradeLabel = t.trades[worker.trade] || worker.trade;
          const workerTx = transactions.filter((t) => t.workerId === worker.id);

          return (
            <div key={worker.id} className="khata-worker-card">
              <div className="khata-card-header">
                <div className="worker-avatar" style={{ backgroundColor: worker.avatarColor || "#10b981" }}>
                  {worker.name.charAt(0).toUpperCase()}
                </div>

                <div className="khata-worker-title">
                  <h3 className="worker-name">{worker.name}</h3>
                  <span className="worker-trade-tag">{tradeLabel}</span>
                </div>

                <div className="khata-balance-badge">
                  <span className="balance-badge-label">{t.khata.balanceDue}</span>
                  <span className="balance-badge-amount">
                    {formatCurrency(fin.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Financial Metrics Row */}
              <div className="khata-metrics-row">
                <div className="khata-metric-item">
                  <span className="metric-tiny-label">
                    {t.status.present}: <strong>{fin.presentCount}d</strong> (HD: {fin.halfDayCount})
                  </span>
                  <span className="metric-num text-emerald">
                    +{formatCurrency(fin.totalEarned)}
                  </span>
                </div>

                <div className="khata-metric-item">
                  <span className="metric-tiny-label">{t.khata.advancesGiven}</span>
                  <span className="metric-num text-amber">
                    -{formatCurrency(fin.totalAdvance)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Kharcha, Settle, WhatsApp, History */}
              <div className="khata-actions-row">
                <button
                  type="button"
                  className="btn-khata-action btn-give-advance"
                  onClick={() => handleOpenAdvance(worker)}
                >
                  <PlusCircle size={16} />
                  <span>{t.actions.addAdvance}</span>
                </button>

                <button
                  type="button"
                  className="btn-khata-action btn-settle-hisaab"
                  onClick={() => handleOpenSettle(worker)}
                  disabled={fin.balanceDue <= 0}
                >
                  <CheckCircle size={16} />
                  <span>{t.actions.settlePayment}</span>
                </button>

                <button
                  type="button"
                  className="btn-khata-icon-action btn-wa"
                  onClick={() => handleWhatsApp(worker)}
                  title="Share WhatsApp Slip"
                >
                  <MessageCircle size={18} />
                </button>

                <button
                  type="button"
                  className="btn-khata-icon-action btn-hist"
                  onClick={() => handleOpenHistory(worker)}
                  title="View History"
                >
                  <History size={18} />
                  <span className="tx-count-pill">{workerTx.length}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance / Settlement Modal */}
      {(modalType === "advance" || modalType === "settlement") && activeModalWorker && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === "advance" ? t.khata.giveAdvanceTitle : t.khata.settleTitle}
              </h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTx} className="modal-form">
              <div className="target-worker-banner">
                <strong>👷 {activeModalWorker.name}</strong>
                <span>
                  {t.khata.balanceDue}: {formatCurrency(calculateWorkerFinancials(activeModalWorker, attendance, transactions).balanceDue)}
                </span>
              </div>

              {/* Amount Input & Presets */}
              <div className="form-group">
                <label className="form-label">{t.khata.amountLabel} *</label>
                <div className="amount-input-wrapper">
                  <IndianRupee size={20} className="currency-symbol" />
                  <input
                    type="number"
                    required
                    min="1"
                    className="amount-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500"
                    autoFocus
                  />
                </div>

                {/* Quick Presets for Thekadars */}
                <div className="quick-amount-presets">
                  {[200, 500, 1000, 2000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`preset-btn ${amount === String(preset) ? "active" : ""}`}
                      onClick={() => setAmount(String(preset))}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Category Presets */}
              <div className="form-group">
                <label className="form-label">{t.khata.reasonLabel}</label>
                <input
                  type="text"
                  className="text-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. राशन / भोजन / आपातकालीन"
                />

                <div className="quick-reason-pills">
                  {t.khata.reasons.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="reason-pill"
                      onClick={() => setReason(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mode */}
              <div className="form-group">
                <label className="form-label">{t.khata.paymentModeLabel}</label>
                <div className="payment-mode-toggles">
                  <button
                    type="button"
                    className={`mode-btn ${paymentMode === "cash" ? "active" : ""}`}
                    onClick={() => setPaymentMode("cash")}
                  >
                    💵 {t.khata.cash}
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${paymentMode === "upi" ? "active" : ""}`}
                    onClick={() => setPaymentMode("upi")}
                  >
                    📱 {t.khata.upi}
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${paymentMode === "bank" ? "active" : ""}`}
                    onClick={() => setPaymentMode("bank")}
                  >
                    🏦 {t.khata.bank}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className={`btn-primary ${modalType === "advance" ? "btn-advance-submit" : "btn-settle-submit"}`}
                >
                  {modalType === "advance" ? `+ ₹${amount || 0} ${t.actions.addAdvance}` : `✓ ₹${amount || 0} ${t.actions.settlePayment}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {modalType === "history" && activeModalWorker && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.khata.transactionHistory}</h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className="history-content">
              <div className="target-worker-banner">
                <strong>👷 {activeModalWorker.name}</strong>
              </div>

              <div className="history-list">
                {transactions.filter((t) => t.workerId === activeModalWorker.id).length === 0 ? (
                  <p className="no-history-text">{t.khata.noTransactions}</p>
                ) : (
                  transactions
                    .filter((t) => t.workerId === activeModalWorker.id)
                    .map((tx) => (
                      <div key={tx.id} className={`history-item item-${tx.type}`}>
                        <div className="history-icon-wrap">
                          {tx.type === "advance" ? (
                            <ArrowDownLeft size={18} className="text-amber" />
                          ) : (
                            <ArrowUpRight size={18} className="text-emerald" />
                          )}
                        </div>

                        <div className="history-info">
                          <div className="history-top-line">
                            <span className="history-type">
                              {tx.type === "advance" ? t.khata.advancesGiven : t.khata.settledAmount}
                            </span>
                            <span className={`history-amount ${tx.type === "advance" ? "text-amber" : "text-emerald"}`}>
                              {tx.type === "advance" ? "-" : "+"} {formatCurrency(tx.amount)}
                            </span>
                          </div>

                          <div className="history-bottom-line">
                            <span className="history-date">
                              <Calendar size={12} /> {tx.date}
                            </span>
                            <span className="history-mode">
                              • {tx.paymentMode?.toUpperCase()} • {tx.category || tx.note || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
