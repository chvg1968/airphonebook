// Funciones para manejar los modales
function showModal(modalId) {
    console.log('Attempting to show modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        // Forzar un reflow antes de cambiar el display
        modal.offsetHeight;
        modal.style.setProperty('display', 'block', 'important');
        console.log(`Modal ${modalId} abierto. Current style:`, {
            display: modal.style.display,
            visibility: modal.style.visibility,
            opacity: modal.style.opacity
        });
    } else {
        console.error(`Modal ${modalId} no encontrado. Available modals:`, 
            Array.from(document.querySelectorAll('.modal')).map(m => m.id));
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        console.log(`Modal ${modalId} cerrado`);
    }
}

let scale = 1;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
let isPanning = false;
let lastTouchDistance = 0;

export function openMapModal() {
    showModal('mapModal');
    setTimeout(setupZoom, 100);
}

function setupZoom() {
    const container = document.querySelector('.map-container');
    const image = document.getElementById('propertyMapImage');
    if (!container || !image) return;

    // Esperar a que la imagen cargue
    if (!image.complete) {
        image.onload = () => initializeZoom(container, image);
    } else {
        initializeZoom(container, image);
    }
}

function initializeZoom(container, image) {
    resetZoom(container, image);

    // Prevenir el scroll del documento cuando se hace zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY * -0.002;
        const newScale = Math.min(Math.max(scale + delta, 1), 5);
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        zoomTo(newScale, x, y, container, image);
    }, { passive: false });

    // Mouse events para pan
    container.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            e.preventDefault();
            startPan(e);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            e.preventDefault();
            pan(e, container, image);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            container.classList.remove('panning');
        }
    });

    // Touch events
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastTouchDistance = getTouchDistance(touch1, touch2);
        } else if (scale > 1) {
            startPan(e.touches[0]);
        }
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = getTouchDistance(touch1, touch2);
            const delta = currentDistance / lastTouchDistance;

            const newScale = Math.min(Math.max(scale * delta, 1), 5);
            const rect = container.getBoundingClientRect();
            const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
            const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

            zoomTo(newScale, centerX, centerY, container, image);
            lastTouchDistance = currentDistance;
        } else if (isPanning) {
            pan(e.touches[0], container, image);
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        lastTouchDistance = 0;
        if (isPanning) {
            isPanning = false;
            container.classList.remove('panning');
        }
    });
}

function getTouchDistance(touch1, touch2) {
    return Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );
}

function startPan(e) {
    isPanning = true;
    startX = (e.clientX || e.touches[0].clientX) - translateX;
    startY = (e.clientY || e.touches[0].clientY) - translateY;
    document.querySelector('.map-container').classList.add('panning');
}

function pan(e, container, image) {
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    translateX = clientX - startX;
    translateY = clientY - startY;

    // Limitar el paneo al área visible
    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    const maxX = (imageRect.width * scale - containerRect.width) / 2;
    const maxY = (imageRect.height * scale - containerRect.height) / 2;

    translateX = Math.min(Math.max(translateX, -maxX), maxX);
    translateY = Math.min(Math.max(translateY, -maxY), maxY);

    updateTransform(image);
}

function zoomTo(newScale, x, y, container, image) {
    if (newScale === scale) return;

    // Calcular el punto de zoom relativo a la imagen
    const rect = image.getBoundingClientRect();
    const prevScale = scale;
    scale = newScale;

    // Ajustar la posición para mantener el punto de zoom
    if (scale > 1) {
        const scaleRatio = scale / prevScale;
        translateX = x - (x - translateX) * scaleRatio;
        translateY = y - (y - translateY) * scaleRatio;
        container.classList.add('zoomed');
    } else {
        translateX = 0;
        translateY = 0;
        container.classList.remove('zoomed');
    }

    updateTransform(image);
}

function resetZoom(container, image) {
    scale = 1;
    translateX = 0;
    translateY = 0;
    isPanning = false;
    container.classList.remove('zoomed', 'panning');
    updateTransform(image);
}

function updateTransform(image) {
    image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

export function closeMapModal() {
    if (panzoomInstance) {
        panzoomInstance.reset();
    }
    hideModal('mapModal');
}

// Funciones para el zoom del mapa




// Golf Cart Modal
export function openGolfCartModal() {
    showModal('golfCartModal');
}

export function closeGolfCartModal() {
    hideModal('golfCartModal');
}

// Golf Rates Modal
export function openGolfRatesModal() {
    console.log('openGolfRatesModal called');
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

// Cerrar los modales cuando se hace clic fuera de ellos
// Kids Club Modal
export function openKidsClubModal() {
    showModal('kidsClubModal');
}

export function closeKidsClubModal() {
    hideModal('kidsClubModal');
}

window.addEventListener('click', (event) => {
    const mapModal = document.getElementById('mapModal');
    const golfCartModal = document.getElementById('golfCartModal');
    const golfRatesModal = document.getElementById('golfRatesModal');
    const tennisModal = document.getElementById('tennisModal');
    const kidsClubModal = document.getElementById('kidsClubModal');
    
    if (event.target === mapModal) {
        closeMapModal();
    } else if (event.target === golfCartModal) {
        closeGolfCartModal();
    } else if (event.target === golfRatesModal) {
        closeGolfRatesModal();
    } else if (event.target === tennisModal) {
        closeTennisModal();
    } else if (event.target === kidsClubModal) {
        closeKidsClubModal();
    }
});
