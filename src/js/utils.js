// utils.js
import { ICONS } from './constants.js';

export function getIcon(type, key, defaultIcon = ' ') {
    if (!key) return defaultIcon;
    const trimmedKey = key.trim();
    const iconMap = ICONS[type];
    if (!iconMap) return defaultIcon;

    // Exact match first
    if (iconMap[trimmedKey]) return iconMap[trimmedKey];

    // Case-insensitive fallback
    const lowerKey = trimmedKey.toLowerCase();
    const match = Object.keys(iconMap).find(k => k.toLowerCase() === lowerKey);
    if (match) return iconMap[match];

    console.warn(`[getIcon] No icon found for type="${type}", key="${trimmedKey}"`);
    return defaultIcon;
}