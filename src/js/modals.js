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
let translateX = 0;
let translateY = 0;
let initialDistance = 0;
let isPanning = false;
let lastX = 0;
let lastY = 0;

export function openMapModal() {
    showModal('mapModal');
    setTimeout(initializeZoom, 100);
}

function initializeZoom() {
    const container = document.getElementById('mapContainer');
    const image = document.getElementById('propertyMapImage');
    if (!container || !image) return;

    resetZoom(container, image);

    // Zoom con rueda del mouse
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        handleMouseWheel(e, container, image);
    });

    // Mouse events
    container.addEventListener('mousedown', (e) => {
        if (scale > 1) startPan(e, container);
    });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) handlePan(e, container, image);
    });

    document.addEventListener('mouseup', () => {
        if (isPanning) endPan(container);
    });

    // Touch events
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            handlePinchStart(e);
        } else if (scale > 1) {
            startPan(e.touches[0], container);
        }
    });

    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            handlePinchMove(e, image);
        } else if (isPanning) {
            handlePan(e.touches[0], container, image);
        }
    });

    container.addEventListener('touchend', () => {
        initialDistance = 0;
        if (isPanning) endPan(container);
    });
}

function handleMouseWheel(e, container, image) {
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calcular el punto de zoom relativo a la imagen
    const beforeZoomX = (mouseX - translateX) / scale;
    const beforeZoomY = (mouseY - translateY) / scale;

    // Ajustar scale
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newScale = Math.min(Math.max(scale * (1 + delta), 1), 4);

    if (newScale !== scale) {
        scale = newScale;
        
        // Mantener el punto bajo el mouse
        if (scale > 1) {
            translateX = mouseX - beforeZoomX * scale;
            translateY = mouseY - beforeZoomY * scale;
            container.classList.add('can-pan');
        } else {
            translateX = 0;
            translateY = 0;
            container.classList.remove('can-pan');
        }

        updateTransform(image);
    }
}

function handlePinchStart(e) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );
}

function handlePinchMove(e, image) {
    if (initialDistance <= 0) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );

    const delta = currentDistance / initialDistance;
    const newScale = Math.min(Math.max(scale * delta, 1), 4);

    if (newScale !== scale) {
        scale = newScale;
        updateTransform(image);
    }

    initialDistance = currentDistance;
}

function startPan(e, container) {
    isPanning = true;
    container.classList.add('panning');
    lastX = e.clientX || e.touches[0].clientX;
    lastY = e.clientY || e.touches[0].clientY;
}

function handlePan(e, container, image) {
    const currentX = e.clientX || e.touches[0].clientX;
    const currentY = e.clientY || e.touches[0].clientY;
    
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;

    translateX += deltaX;
    translateY += deltaY;

    lastX = currentX;
    lastY = currentY;

    updateTransform(image);
}

function endPan(container) {
    isPanning = false;
    container.classList.remove('panning');
}

function resetZoom(container, image) {
    scale = 1;
    translateX = 0;
    translateY = 0;
    isPanning = false;
    container.classList.remove('can-pan', 'panning');
    updateTransform(image);
}

function updateTransform(image) {
    // Limitar el paneo
    const maxTranslate = (scale - 1) * image.offsetWidth / 2;
    translateX = Math.min(Math.max(translateX, -maxTranslate), maxTranslate);
    translateY = Math.min(Math.max(translateY, -maxTranslate), maxTranslate);

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
