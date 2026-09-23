/**
 * MindSaathi - Local IndexedDB Offline Storage Service
 * Provides offline-first caching for cognitive sessions and reminders.
 * Clean architecture ready for Dexie or direct IndexedDB operations.
 */

const DB_NAME = 'MindSaathiLocalDB';
const DB_VERSION = 1;

class OfflineDBService {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Store for pending offline game sessions
        if (!db.objectStoreNames.contains('offlineSessions')) {
          db.createObjectStore('offlineSessions', { keyPath: 'id', autoIncrement: true });
        }
        // Store for cached daily reminders
        if (!db.objectStoreNames.contains('cachedReminders')) {
          db.createObjectStore('cachedReminders', { keyPath: '_id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB initialization failed:', event.target.error);
        resolve(null);
      };
    });
  }

  async saveOfflineSession(sessionData) {
    await this.initPromise;
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('offlineSessions', 'readwrite');
      const store = tx.objectStore('offlineSessions');
      const item = { ...sessionData, savedAt: new Date().toISOString() };
      const req = store.add(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getOfflineSessions() {
    await this.initPromise;
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db.transaction('offlineSessions', 'readonly');
      const store = tx.objectStore('offlineSessions');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async cacheReminders(reminders) {
    await this.initPromise;
    if (!this.db || !Array.isArray(reminders)) return;

    const tx = this.db.transaction('cachedReminders', 'readwrite');
    const store = tx.objectStore('cachedReminders');
    reminders.forEach((r) => store.put(r));
  }

  async getCachedReminders() {
    await this.initPromise;
    if (!this.db) return [];

    return new Promise((resolve) => {
      const tx = this.db.transaction('cachedReminders', 'readonly');
      const store = tx.objectStore('cachedReminders');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }
}

export const offlineDB = new OfflineDBService();
