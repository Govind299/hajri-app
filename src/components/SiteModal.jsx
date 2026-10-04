import React, { useState } from "react";
import { translations } from "../translations";
import { Building2, MapPin, X } from "lucide-react";

export default function SiteModal({ lang, isOpen, onClose, onSaveSite }) {
  const t = translations[lang];
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveSite({
      id: `site-${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
      status: "active"
    });

    setName("");
    setLocation("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏗️ {t.addSite}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">साइट का नाम / Site Name *</label>
            <div className="text-input-icon-wrap">
              <Building2 size={18} className="input-inner-icon" />
              <input
                type="text"
                required
                className="text-input pl-input"
                placeholder="e.g. शांति हाइट्स / Shanti Heights"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">स्थान / Location (Optional)</label>
            <div className="text-input-icon-wrap">
              <MapPin size={18} className="input-inner-icon" />
              <input
                type="text"
                className="text-input pl-input"
                placeholder="e.g. सेक्टर 21, गांधीनगर"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.actions.cancel}
            </button>
            <button type="submit" className="btn-primary">
              {t.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
