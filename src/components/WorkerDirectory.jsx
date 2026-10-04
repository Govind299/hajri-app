import React, { useState } from "react";
import { translations } from "../translations";
import { formatCurrency } from "../utils/calculations";
import { 
  UserPlus, 
  Phone, 
  Building2, 
  Edit, 
  Trash2, 
  X, 
  IndianRupee, 
  Briefcase,
  Search
} from "lucide-react";

export default function WorkerDirectory({
  lang,
  workers = [],
  sites = [],
  selectedSiteId,
  onSaveWorker,
  onDeleteWorker,
  isOpenAddModal = false,
  onCloseAddModal
}) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState("");
  const [editingWorker, setEditingWorker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(isOpenAddModal);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    trade: "majdur",
    wageType: "daily",
    rate: "550",
    hourlyOtRate: "70",
    siteId: selectedSiteId === "all" ? sites[0]?.id || "site-1" : selectedSiteId
  });

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setFormData({
      name: "",
      phone: "",
      trade: "majdur",
      wageType: "daily",
      rate: "550",
      hourlyOtRate: "70",
      siteId: selectedSiteId === "all" ? sites[0]?.id || "site-1" : selectedSiteId
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone || "",
      trade: worker.trade || "majdur",
      wageType: worker.wageType || "daily",
      rate: String(worker.rate || "550"),
      hourlyOtRate: String(worker.hourlyOtRate || "70"),
      siteId: worker.siteId || sites[0]?.id || "site-1"
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingWorker(null);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const rateNum = Number(formData.rate) || 500;
    const otRateNum = Number(formData.hourlyOtRate) || Math.round(rateNum / 8);

    onSaveWorker({
      id: editingWorker ? editingWorker.id : `w-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      trade: formData.trade,
      wageType: formData.wageType,
      rate: rateNum,
      hourlyOtRate: otRateNum,
      siteId: formData.siteId,
      isActive: true,
      avatarColor: editingWorker?.avatarColor || ["#10b981", "#6366f1", "#f59e0b", "#06b6d4", "#ec4899"][Math.floor(Math.random() * 5)]
    });

    handleClose();
  };

  // Sync prop changes
  React.useEffect(() => {
    if (isOpenAddModal) {
      handleOpenAdd();
    }
  }, [isOpenAddModal]);

  // Filtered workers
  const visibleWorkers = workers.filter((worker) => {
    const matchesSite = selectedSiteId === "all" ? true : worker.siteId === selectedSiteId;
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.phone && worker.phone.includes(searchTerm));
    return matchesSite && matchesSearch;
  });

  return (
    <div className="workers-directory-screen">
      {/* Top Controls */}
      <div className="directory-header-row">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={t.actions.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenAdd}
        >
          <UserPlus size={18} />
          <span>{t.actions.addWorker}</span>
        </button>
      </div>

      {/* Workers Cards List */}
      <div className="directory-cards-grid">
        {visibleWorkers.length === 0 ? (
          <div className="empty-state-card">
            <h3>No workers found</h3>
            <p>Add your workers or team members to get started.</p>
          </div>
        ) : (
          visibleWorkers.map((worker) => {
            const siteObj = sites.find((s) => s.id === worker.siteId);
            const tradeLabel = t.trades[worker.trade] || worker.trade;

            return (
              <div key={worker.id} className="directory-worker-card">
                <div className="dir-card-top">
                  <div
                    className="worker-avatar"
                    style={{ backgroundColor: worker.avatarColor || "#10b981" }}
                  >
                    {worker.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="dir-worker-info">
                    <h3 className="worker-name">{worker.name}</h3>
                    <span className="worker-trade-tag">{tradeLabel}</span>
                  </div>

                  <div className="dir-card-actions">
                    <button
                      type="button"
                      className="icon-action-btn"
                      onClick={() => handleOpenEdit(worker)}
                      title={t.actions.edit}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-action-btn text-red"
                      onClick={() => onDeleteWorker(worker.id)}
                      title={t.actions.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="dir-card-details">
                  <div className="detail-item">
                    <IndianRupee size={15} />
                    <span>
                      {formatCurrency(worker.rate)} / {t.wageTypes[worker.wageType] || "day"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <Briefcase size={15} />
                    <span>OT: {formatCurrency(worker.hourlyOtRate)}/hr</span>
                  </div>

                  {worker.phone && (
                    <div className="detail-item">
                      <Phone size={15} />
                      <a href={`tel:${worker.phone}`}>{worker.phone}</a>
                    </div>
                  )}

                  {siteObj && (
                    <div className="detail-item">
                      <Building2 size={15} />
                      <span>{siteObj.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Worker Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingWorker ? t.workerForm.titleEdit : t.workerForm.titleAdd}
              </h3>
              <button type="button" className="modal-close-btn" onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">{t.workerForm.name} *</label>
                <input
                  type="text"
                  required
                  className="text-input"
                  placeholder="e.g. राम सिंह (Ram Singh)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
              </div>

              {/* Mobile Phone */}
              <div className="form-group">
                <label className="form-label">{t.workerForm.phone}</label>
                <input
                  type="tel"
                  className="text-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Trade / Skill */}
              <div className="form-group">
                <label className="form-label">{t.workerForm.trade}</label>
                <select
                  className="select-input"
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                >
                  <option value="mistri">{t.trades.mistri}</option>
                  <option value="majdur">{t.trades.majdur}</option>
                  <option value="carpenter">{t.trades.carpenter}</option>
                  <option value="plumber">{t.trades.plumber}</option>
                  <option value="electrician">{t.trades.electrician}</option>
                  <option value="painter">{t.trades.painter}</option>
                  <option value="welder">{t.trades.welder}</option>
                  <option value="supervisor">{t.trades.supervisor}</option>
                </select>
              </div>

              {/* Daily Wage Rate */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.workerForm.rate} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="text-input"
                    value={formData.rate}
                    onChange={(e) => {
                      const newRate = e.target.value;
                      setFormData({
                        ...formData,
                        rate: newRate,
                        hourlyOtRate: String(Math.round((Number(newRate) || 0) / 8))
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.workerForm.hourlyOtRate}</label>
                  <input
                    type="number"
                    min="0"
                    className="text-input"
                    value={formData.hourlyOtRate}
                    onChange={(e) => setFormData({ ...formData, hourlyOtRate: e.target.value })}
                  />
                </div>
              </div>

              {/* Assigned Site */}
              <div className="form-group">
                <label className="form-label">{t.workerForm.site}</label>
                <select
                  className="select-input"
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  {t.actions.cancel}
                </button>
                <button type="submit" className="btn-primary">
                  {t.actions.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
