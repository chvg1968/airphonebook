// --- MAP MODAL PANZOOM FINAL OPTIMIZED + NO OVERLAYS ---
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
    } else {
        console.error(`[MODAL ERROR] No existe un elemento con id="${modalId}" en el DOM.`);
        const allModals = Array.from(document.querySelectorAll('.modal')).map(m => m.id);
        console.warn('Modales encontrados en el DOM:', allModals);
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        console.log(`Modal ${modalId} cerrado`);
    }
}

let panzoomInstance = null;
let wheelHandler = null;

function setupZoom() {
    const map = document.getElementById('propertyMapImage');
    if (!map) return;
    map.style.transform = 'none'; // Elimina cualquier transformación previa
    // Destruir instancia anterior si existe
    if (panzoomInstance) {
        map.parentElement.removeEventListener('wheel', wheelHandler);
        panzoomInstance.destroy();
        panzoomInstance = null;
    }
    panzoomInstance = Panzoom(map, {
        maxScale: 5,
        minScale: 1,
        contain: 'outside', // Permite panear incluso en escala mínima
        startScale: 1,
        animate: true,
        disableXAxis: false,
        disableYAxis: false,
        excludeClass: 'zoom-btn', // Asegura que los controles no bloqueen paneo
        step: 0.2,
    });
    // Habilita los eventos de wheel y pinch para zoom interactivo
    wheelHandler = panzoomInstance.zoomWithWheel;
    map.parentElement.addEventListener('wheel', wheelHandler);

    // Permitir paneo siempre
    panzoomInstance.setOptions({ panOnlyWhenZoomed: false });

    // Controles de zoom
    const zoomInBtn = document.querySelector('.zoom-in');
    const zoomOutBtn = document.querySelector('.zoom-out');
    const zoomResetBtn = document.querySelector('.zoom-reset');
    console.log('Panzoom instance:', panzoomInstance);
    if (zoomInBtn) zoomInBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('ZOOM IN CLICK', panzoomInstance);
        panzoomInstance.zoomIn();
        console.log('Current scale after zoomIn:', panzoomInstance.getScale());
    };
    if (zoomOutBtn) zoomOutBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('ZOOM OUT CLICK', panzoomInstance);
        panzoomInstance.zoomOut();
    };
    if (zoomResetBtn) zoomResetBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('RESET CLICK', panzoomInstance);
        panzoomInstance.reset();
        console.log('Current scale after reset:', panzoomInstance.getScale());
        console.log('Current transform:', map.style.transform);
    };

}

// Variables para trackear cambios de viewport
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

function adjustMapModalDimensions() {
    const container = document.querySelector('.map-container');
    const map = document.getElementById('propertyMapImage');

    if (!container || !map) return;

    // Solo ajustar si realmente cambió el tamaño significativamente
    const widthChanged = Math.abs(window.innerWidth - lastWidth) > 50;
    const heightChanged = Math.abs(window.innerHeight - lastHeight) > 50;

    if (widthChanged || heightChanged) {
        container.style.width = '100%';
        container.style.height = '100%';

        // Solo resetear en cambio de orientación real, no en resize de barras
        if (panzoomInstance && widthChanged && heightChanged) {
            // Guardar escala actual
            const currentScale = panzoomInstance.getScale();

            // Solo resetear si está muy zoomeado (escala > 3)
            // Esto preserva el zoom del usuario en rotaciones
            if (currentScale > 3) {
                panzoomInstance.reset();
            }
        }

        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
    }
}

// Usar debounce para evitar múltiples llamadas en resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(adjustMapModalDimensions, 150);
});

// Esperar a que termine la rotación antes de ajustar
window.addEventListener('orientationchange', () => {
    setTimeout(adjustMapModalDimensions, 300);
});

// Imágenes de zonas específicas que se muestran en la misma modal del mapa
// (con el mismo zoom, controles y aviso de orientación que el mapa principal).
const MAP_FOCUS_IMAGES = {
    kidsPark: '/assets/images/kids-park-zone.jpg',
};

export function openMapModal({ focus } = {}) {
    const focusImage = MAP_FOCUS_IMAGES[focus];
    const map = document.getElementById('propertyMapImage');
    if (map && focusImage) {
        // Guardar el mapa de la propiedad para restaurarlo al cerrar
        if (!map.dataset.propertySrc) map.dataset.propertySrc = map.getAttribute('src');
        if (map.getAttribute('src') !== focusImage) {
            // Ocultar hasta que cargue para no mostrar un instante el mapa completo
            map.style.visibility = 'hidden';
            const reveal = () => { map.style.visibility = ''; };
            map.addEventListener('load', reveal, { once: true });
            map.addEventListener('error', reveal, { once: true });
            map.src = focusImage;
        }
    }
    document.getElementById('mapModal')?.classList.toggle('kids-park-focus', focus === 'kidsPark');
    showModal('mapModal');
    setTimeout(() => {
        setupZoom();
        adjustMapModalDimensions();
        handleOrientationWarning();
    }, 50);
}

function handleOrientationWarning() {
    const warning = document.getElementById('orientation-warning');
    function checkOrientation() {
        if(window.innerHeight > window.innerWidth) {
            warning.style.display = 'flex';
        } else {
            warning.style.display = 'none';
        }
    }
    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
}


export function closeMapModal() {
    if (panzoomInstance) {
        panzoomInstance.reset();
    }
    hideModal('mapModal');
    document.getElementById('mapModal')?.classList.remove('kids-park-focus');
    const map = document.getElementById('propertyMapImage');
    if (map?.dataset.propertySrc) {
        map.src = map.dataset.propertySrc;
        delete map.dataset.propertySrc;
    }
}

// --- MODALS GENERIC OPEN/CLOSE FUNCTIONS ---

export function openGolfCartInfoModal() {
    showModal('golfCartInfoModal');
}
export function closeGolfCartInfoModal() {
    hideModal('golfCartInfoModal');
}

export function openGolfCartRulesModal() {
    showModal('golfCartRulesModal');
}
export function closeGolfCartRulesModal() {
    hideModal('golfCartRulesModal');
}

export function openGolfRatesModal() {
    showModal('golfRatesModal');
}
export function closeGolfRatesModal() {
    hideModal('golfRatesModal');
}

export function openTennisModal() {
    showModal('tennisModal');
}
export function closeTennisModal() {
    hideModal('tennisModal');
}

export function openKidsClubModal() {
    showModal('kidsClubModal');
}
export function closeKidsClubModal() {
    hideModal('kidsClubModal');
}

export function openGroceryShoppingModal() {
    showModal('groceryShoppingModal');
}
export function closeGroceryShoppingModal() {
    hideModal('groceryShoppingModal');
}

export function openCleaningFeesModal() {
    showModal('cleaningFeesModal');
}
export function closeCleaningFeesModal() {
    hideModal('cleaningFeesModal');
}

// Si necesitas más modales, sigue este patrón.

export function openGolfCartChargingModal() {
    showModal('golfCartChargingModal');
}
export function closeGolfCartChargingModal() {
    hideModal('golfCartChargingModal');
}

export function openGolfCartParkingModal() {
    showModal('golfCartParkingModal');
}
export function closeGolfCartParkingModal() {
    hideModal('golfCartParkingModal');
}
