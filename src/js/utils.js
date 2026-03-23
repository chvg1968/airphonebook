// utils.js
import { ICONS } from './constants.js';

export function getIcon(type, key, defaultIcon = ' ') {
    const trimmedKey = key?.trim();
    const icon = ICONS[type]?.[trimmedKey];
    if (!icon && trimmedKey) {
        console.warn(`[getIcon] No icon found for type="${type}", key="${trimmedKey}"`);
    }
    return icon || defaultIcon;
}