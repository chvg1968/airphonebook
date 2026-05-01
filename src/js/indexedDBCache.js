/**
 * IndexedDB Cache Module for Airphonebook
 * Implements stale-while-revalidate pattern for offline-first experience
 */

const DB_NAME = 'airphonebook-cache';
const DB_VERSION = 1;
const STORE_NAME = 'contacts';
const META_STORE = 'metadata';

let dbInstance = null;

/**
 * Opens or creates the IndexedDB database
 */
async function openDB() {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('❌ Error opening IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Store for contacts
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }

            // Store for metadata (last update timestamp, etc.)
            if (!db.objectStoreNames.contains(META_STORE)) {
                db.createObjectStore(META_STORE, { keyPath: 'key' });
            }
        };
    });
}

/**
 * Saves contacts to IndexedDB
 * @param {Array} contacts - Array of contact objects
 */
export async function saveContacts(contacts) {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME, META_STORE], 'readwrite');
        const contactsStore = transaction.objectStore(STORE_NAME);
        const metaStore = transaction.objectStore(META_STORE);

        // Clear existing contacts
        await new Promise((resolve, reject) => {
            const clearRequest = contactsStore.clear();
            clearRequest.onsuccess = resolve;
            clearRequest.onerror = () => reject(clearRequest.error);
        });

        // Add all contacts
        for (const contact of contacts) {
            contactsStore.add(contact);
        }

        // Save last update timestamp
        metaStore.put({ key: 'lastUpdate', value: Date.now() });

        await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });

        return true;
    } catch (error) {
        console.error('❌ Error saving to IndexedDB:', error);
        return false;
    }
}

/**
 * Gets all contacts from IndexedDB
 * @returns {Array} Array of contact objects
 */
export async function getContacts() {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('❌ Error reading from IndexedDB:', error);
        return [];
    }
}

/**
 * Gets the last update timestamp
 * @returns {number|null} Timestamp or null if never updated
 */
export async function getLastUpdate() {
    try {
        const db = await openDB();
        const transaction = db.transaction(META_STORE, 'readonly');
        const store = transaction.objectStore(META_STORE);

        return new Promise((resolve, reject) => {
            const request = store.get('lastUpdate');
            request.onsuccess = () => {
                resolve(request.result?.value || null);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('❌ Error reading metadata:', error);
        return null;
    }
}

/**
 * Formats the last update time as a human-readable string
 * @returns {string} Formatted time string
 */
export async function getLastUpdateFormatted() {
    const timestamp = await getLastUpdate();
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

/**
 * Checks if cached data exists
 * @returns {boolean}
 */
export async function hasCachedData() {
    const contacts = await getContacts();
    return contacts.length > 0;
}

/**
 * Clears all cached data
 */
export async function clearCache() {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME, META_STORE], 'readwrite');
        
        transaction.objectStore(STORE_NAME).clear();
        transaction.objectStore(META_STORE).clear();

        await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });

        return true;
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        return false;
    }
}
