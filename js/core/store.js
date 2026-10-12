// Progression de l'utilisateur, enregistrée dans localStorage (stockage injectable pour les tests).
import { STORAGE_KEY } from '../config.js';

export function emptyState() {
  return { custom: [], progress: {}, qcm: {}, log: {}, cases: {}, exams: {} };
}

export function isValidBackup(d) {
  return !!d && typeof d === 'object' && Array.isArray(d.custom);
}

export function createStore(storage, key = STORAGE_KEY) {
  let state = emptyState();
  try {
    const raw = storage && storage.getItem(key);
    if (raw) state = Object.assign(emptyState(), JSON.parse(raw));
  } catch (e) { /* stockage indisponible ou corrompu : on travaille en mémoire */ }

  return {
    get state() { return state; },
    save() {
      try { storage && storage.setItem(key, JSON.stringify(state)); } catch (e) { /* ignore */ }
    },
    replace(data) { state = Object.assign(emptyState(), data); this.save(); },
    resetProgress() {
      state.progress = {}; state.qcm = {}; state.log = {}; state.cases = {};
      this.save();
    },
  };
}
