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

function setupZoom() {
    const map = document.getElementById('propertyMapImage');
    if (!map) return;
    map.style.transform = 'none'; // Elimina cualquier transformación previa
    // Destruir instancia anterior si existe
    if (panzoomInstance) {
        panzoomInstance.destroy();
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
    map.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

    // Permitir paneo siempre
    panzoomInstance.setOptions({ panOnlyWhenZoomed: false });

    // Forzar actualización de transform manualmente tras zoom
    function updateTransform() {
        map.style.transform = panzoomInstance.getTransform();
    }

    // No agregues pointerdown aquí, Panzoom lo maneja internamente


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
        // Forzar actualización visual
        map.style.transform = panzoomInstance.getTransform();
        console.log('Current scale after zoomIn:', panzoomInstance.getScale());
        console.log('Current transform:', map.style.transform);
    };
    if (zoomOutBtn) zoomOutBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('ZOOM OUT CLICK', panzoomInstance);
        panzoomInstance.zoomOut();
        map.style.transform = panzoomInstance.getTransform();
        console.log('Current scale after zoomOut:', panzoomInstance.getScale());
        console.log('Current transform:', map.style.transform);
    };
    if (zoomResetBtn) zoomResetBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('RESET CLICK', panzoomInstance);
        panzoomInstance.reset();
        map.style.transform = panzoomInstance.getTransform();
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

export function openMapModal() {
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

