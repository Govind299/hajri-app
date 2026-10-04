// LocalStorage offline sync manager
import { initialSites, initialWorkers, initialAttendance, initialTransactions } from "../initialData";

const STORAGE_KEYS = {
  SITES: "hajri_sites_v1",
  WORKERS: "hajri_workers_v1",
  ATTENDANCE: "hajri_attendance_v1",
  TRANSACTIONS: "hajri_transactions_v1",
  LANGUAGE: "hajri_language_v1",
  SELECTED_SITE: "hajri_selected_site_v1"
};

export const loadStoredData = () => {
  try {
    const sites = JSON.parse(localStorage.getItem(STORAGE_KEYS.SITES)) || initialSites;
    const workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKERS)) || initialWorkers;
    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || initialAttendance;
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || initialTransactions;
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "hi"; // Default to Hindi
    const selectedSite = localStorage.getItem(STORAGE_KEYS.SELECTED_SITE) || "site-1";

    return { sites, workers, attendance, transactions, lang, selectedSite };
  } catch (e) {
    console.error("Error reading localStorage:", e);
    return {
      sites: initialSites,
      workers: initialWorkers,
      attendance: initialAttendance,
      transactions: initialTransactions,
      lang: "hi",
      selectedSite: "site-1"
    };
  }
};

export const saveToStorage = (key, data) => {
  try {
    const storageKey = STORAGE_KEYS[key.toUpperCase()] || key;
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
};

export const setStoredLanguage = (lang) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error("Error saving language:", e);
  }
};
