import { 
    saveContacts, 
    getContacts, 
    getLastUpdateFormatted,
    hasCachedData 
} from './indexedDBCache.js';

// Event for notifying UI about data updates
const dataUpdateEvent = new CustomEvent('contactsUpdated', { detail: { source: 'network' } });

/**
 * Processes raw contacts from API into normalized format
 */
function processContacts(rawContacts) {
    return rawContacts
        .filter(contact => contact.name)
        .map(contact => ({
            name: contact.name,
            phone: contact.phone || '',
            section: contact.section || 'Sin Sección',
            category: contact.category || 'Sin Categoría',
            subcategory: contact.subcategories || '',
            description: contact.description || '',
            icon: contact.icon || ''
        }));
}

/**
 * Fetches contacts from the server
 */
async function fetchFromServer() {
    console.log('🔄 Fetching from server...');
    const response = await fetch('/api/fetchContacts');

    if (!response.ok) {
        const errorText = await response.text();
        console.error('📄 Server response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText}`);
    }

    const data = await response.json();
    console.log("📋 Data received from server:", data.contacts.length, "contacts");
    return processContacts(data.contacts);
}

/**
 * Stale-While-Revalidate strategy:
 * 1. Return cached data immediately (if available)
 * 2. Fetch fresh data in background
 * 3. Update cache and notify UI if data changed
 * 
 * @param {Function} onUpdate - Callback when fresh data arrives
 * @returns {Array} Contacts (from cache or server)
 */
export async function fetchAllContacts(onUpdate = null) {
    try {
        // Step 1: Check for cached data
        const hasCached = await hasCachedData();
        let cachedContacts = [];

        if (hasCached) {
            cachedContacts = await getContacts();
            console.log(`⚡ Returning ${cachedContacts.length} cached contacts instantly`);
            
            // Update last update indicator
            updateLastUpdateIndicator();
        }

        // Step 2: Fetch fresh data in background
        const fetchPromise = fetchFromServer()
            .then(async (freshContacts) => {
                // Step 3: Compare and update if different
                const hasChanges = JSON.stringify(cachedContacts) !== JSON.stringify(freshContacts);
                
                if (hasChanges) {
                    console.log('🔄 Data changed, updating cache...');
                    await saveContacts(freshContacts);
                    updateLastUpdateIndicator();
                    
                    // Notify UI about update
                    if (onUpdate) {
                        onUpdate(freshContacts);
                    }
                    window.dispatchEvent(new CustomEvent('contactsUpdated', { 
                        detail: { contacts: freshContacts, source: 'network' } 
                    }));
                } else {
                    console.log('✅ Data unchanged, cache is current');
                }
                
                return freshContacts;
            })
            .catch(error => {
                console.error("❌ Error fetching from server:", error);
                // If we have cached data, that's fine - we'll use it
                if (hasCached) {
                    console.log('📦 Using cached data due to network error');
                }
                return cachedContacts;
            });

        // If we have cached data, return it immediately
        // The background fetch will update the cache
        if (hasCached && cachedContacts.length > 0) {
            // Don't await - let it run in background
            fetchPromise.catch(() => {}); // Prevent unhandled rejection
            return cachedContacts;
        }

        // No cache - must wait for server response
        const freshContacts = await fetchPromise;
        await saveContacts(freshContacts);
        updateLastUpdateIndicator();
        return freshContacts;

    } catch (error) {
        console.error("❌ Error in fetchAllContacts:", error);
        
        // Last resort: try to return cached data
        const cached = await getContacts();
        if (cached.length > 0) {
            console.log('📦 Returning cached data after error');
            return cached;
        }
        
        return [];
    }
}

/**
 * Forces a refresh from the server, bypassing cache
 */
export async function forceRefresh() {
    console.log('🔄 Force refreshing contacts...');
    try {
        const freshContacts = await fetchFromServer();
        await saveContacts(freshContacts);
        updateLastUpdateIndicator();
        
        window.dispatchEvent(new CustomEvent('contactsUpdated', { 
            detail: { contacts: freshContacts, source: 'force-refresh' } 
        }));
        
        return freshContacts;
    } catch (error) {
        console.error("❌ Error during force refresh:", error);
        throw error;
    }
}

/**
 * Updates the last update indicator in the UI
 */
async function updateLastUpdateIndicator() {
    const indicator = document.getElementById('last-update-indicator');
    if (indicator) {
        const formatted = await getLastUpdateFormatted();
        indicator.textContent = `Last updated: ${formatted}`;
    }
}

// Export for external use
export { getLastUpdateFormatted } from './indexedDBCache.js';
