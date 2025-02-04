// utils.js
export function getIcon(type, key, defaultIcon = ' ') {
    return ICONS[type]?.[key] || defaultIcon;
}