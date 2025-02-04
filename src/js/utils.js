// utils.js
import { ICONS } from './constants.js';

export function getIcon(type, key, defaultIcon = ' ') {
    return ICONS[type]?.[key] || defaultIcon;
}