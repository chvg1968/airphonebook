// --- MAP MODAL PANZOOM FINAL OPTIMIZED + NO OVERLAYS ---
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
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

function adjustMapModalDimensions() {
    const container = document.querySelector('.map-container');
    const map = document.getElementById('propertyMapImage');
    if (container && map) {
        container.style.width = '100%';
        container.style.height = '100%';
        map.style.transform = 'none';
        if (panzoomInstance) {
            panzoomInstance.reset();
        }
    }
}

window.addEventListener('resize', adjustMapModalDimensions);
window.addEventListener('orientationchange', adjustMapModalDimensions);

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

// (Resto de funciones para otros modales se mantienen igual) //
