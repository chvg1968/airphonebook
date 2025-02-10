// Funciones para manejar los modales
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

// Variable para la instancia de Panzoom
let panzoomInstance = null;

// Funciones exportadas para los botones de zoom
export function zoomIn() {
    if (panzoomInstance) {
        panzoomInstance.zoomIn();
    }
}

export function zoomOut() {
    if (panzoomInstance) {
        panzoomInstance.zoomOut();
    }
}

export function resetZoom() {
    if (panzoomInstance) {
        panzoomInstance.reset();
    }
}

// Ocultar las instrucciones después de un tiempo
function hideInstructions() {
    const instructions = document.querySelector('.map-instructions');
    if (instructions) {
        instructions.classList.add('fade');
    }
}

export function openMapModal() {
    showModal('mapModal');
    setupZoom();
}

function setupZoom() {
    const container = document.querySelector('.map-container');
    const image = document.getElementById('propertyMapImage');
    if (!container || !image) return;

    // Mostrar instrucciones y ocultarlas después de 5 segundos
    setTimeout(hideInstructions, 5000);

    // Esperar a que la imagen cargue
    if (!image.complete) {
        image.onload = () => initializeZoom(container);
    } else {
        initializeZoom(container);
    }
}

function initializeZoom(container) {
    // Destruir instancia anterior si existe
    if (panzoomInstance) {
        panzoomInstance.destroy();
    }

    // Inicializar Panzoom con opciones mejoradas
    panzoomInstance = Panzoom(container, {
        maxScale: 4,
        minScale: 1,
        contain: 'outside',
        startScale: 1,
        step: 0.1,
        animate: true
    });

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        panzoomInstance.zoomWithWheel(e);
    });

    // Actualizar el cursor
    container.style.cursor = 'grab';

    container.addEventListener('mousedown', () => {
        container.style.cursor = 'grabbing';
    });

    container.addEventListener('mouseup', () => {
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseleave', () => {
        container.style.cursor = 'grab';
    });

    // Prevenir el zoom por defecto en móviles
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
        }
    }, { passive: false });
}

export function closeMapModal() {
    if (panzoomInstance) {
        panzoomInstance.reset();
    }
    hideModal('mapModal');
}

// Golf Cart Modal
export function openGolfCartModal() {
    showModal('golfCartModal');
}

export function closeGolfCartModal() {
    hideModal('golfCartModal');
}

// Golf Rates Modal
export function openGolfRatesModal() {
    showModal('golfRatesModal');
}

export function closeGolfRatesModal() {
    hideModal('golfRatesModal');
}

// Tennis Modal
export function openTennisModal() {
    showModal('tennisModal');
}

export function closeTennisModal() {
    hideModal('tennisModal');
}

// Kids Club Modal
export function openKidsClubModal() {
    showModal('kidsClubModal');
}

export function closeKidsClubModal() {
    hideModal('kidsClubModal');
}

// Cerrar los modales cuando se hace clic fuera de ellos
window.addEventListener('click', (event) => {
    const mapModal = document.getElementById('mapModal');
    const golfCartModal = document.getElementById('golfCartModal');
    const golfRatesModal = document.getElementById('golfRatesModal');
    const tennisModal = document.getElementById('tennisModal');
    const kidsClubModal = document.getElementById('kidsClubModal');

    if (event.target === mapModal) {
        closeMapModal();
    }
    if (event.target === golfCartModal) {
        closeGolfCartModal();
    }
    if (event.target === golfRatesModal) {
        closeGolfRatesModal();
    }
    if (event.target === tennisModal) {
        closeTennisModal();
    }
    if (event.target === kidsClubModal) {
        closeKidsClubModal();
    }
});


