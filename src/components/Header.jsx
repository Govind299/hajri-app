import React from "react";
import { translations } from "../translations";
import { formatCurrency } from "../utils/calculations";
import { 
  Building2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  IndianRupee,
  Languages
} from "lucide-react";

export default function Header({
  lang,
  setLang,
  sites = [],
  selectedSiteId,
  setSelectedSiteId,
  currentDate,
  setCurrentDate,
  siteMetrics,
  onOpenNewSite
}) {
  const t = translations[lang];

  // Date navigator helpers
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    setCurrentDate(`${yr}-${mo}-${da}`);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    setCurrentDate(`${yr}-${mo}-${da}`);
  };

  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const formatted = d.toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      weekday: "short"
    });

    return isToday ? `${t.today} (${formatted})` : formatted;
  };

  return (
    <header className="app-header">
      {/* Top Navbar */}
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-logo">
            <Building2 className="brand-icon" size={24} />
          </div>
          <div>
            <h1 className="brand-title">{t.appName}</h1>
            <p className="brand-tagline">{t.tagline}</p>
          </div>
        </div>

        {/* 3-Language Switcher Pill */}
        <div className="lang-switcher" aria-label="Language Switcher">
          <Languages size={15} className="lang-icon" />
          <button
            type="button"
            className={`lang-btn ${lang === "hi" ? "active" : ""}`}
            onClick={() => setLang("hi")}
          >
            हिंदी
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === "gu" ? "active" : ""}`}
            onClick={() => setLang("gu")}
          >
            ગુજરાતી
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>

      {/* Site and Date Control Bar */}
      <div className="controls-row">
        {/* Site Picker */}
        <div className="site-select-wrapper">
          <Building2 size={18} className="control-icon" />
          <select
            className="site-dropdown"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            <option value="all">🌐 {t.actions.filterAll} Sites ({sites.length})</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                🏗️ {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-add-site-quick"
            onClick={onOpenNewSite}
            title={t.addSite}
          >
            +
          </button>
        </div>

        {/* Date Navigator */}
        <div className="date-navigator">
          <button
            type="button"
            className="date-nav-btn"
            onClick={handlePrevDay}
            title="Previous Day"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="date-label-wrapper">
            <Calendar size={16} className="date-cal-icon" />
            <input
              type="date"
              className="hidden-date-input"
              value={currentDate}
              onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
            />
            <span className="current-date-text">{formatDateDisplay(currentDate)}</span>
          </div>
          <button
            type="button"
            className="date-nav-btn"
            onClick={handleNextDay}
            title="Next Day"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* High-Impact Visual Summary Counters */}
      <div className="metrics-strip">
        <div className="metric-card metric-workers">
          <div className="metric-icon-box">
            <Users size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{siteMetrics.totalWorkers}</span>
            <span className="metric-label">{t.metrics.totalWorkers}</span>
          </div>
        </div>

        <div className="metric-card metric-present">
          <div className="metric-icon-box">
            <CheckCircle2 size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{siteMetrics.presentToday}</span>
            <span className="metric-label">{t.status.present}</span>
          </div>
        </div>

        <div className="metric-card metric-halfday">
          <div className="metric-icon-box">
            <Clock size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{siteMetrics.halfDayToday}</span>
            <span className="metric-label">{t.status.halfDay}</span>
          </div>
        </div>

        <div className="metric-card metric-absent">
          <div className="metric-icon-box">
            <XCircle size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{siteMetrics.absentToday}</span>
            <span className="metric-label">{t.status.absent}</span>
          </div>
        </div>

        <div className="metric-card metric-wage">
          <div className="metric-icon-box">
            <IndianRupee size={18} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{formatCurrency(siteMetrics.totalWageToday)}</span>
            <span className="metric-label">{t.metrics.totalEarnedToday}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
