// Variables para el manejo de gestos táctiles
let initialDistance = 0;
let currentScale = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
let lastTouchDistance = 0;
let isZooming = false;

// Elemento del mapa y su contenedor
let mapImage = null;
let mapContainer = null;

// Función para inicializar la interacción con el mapa
export function initializeMapInteraction() {
    mapImage = document.getElementById('propertyMapImage');
    mapContainer = document.querySelector('.map-container');
    if (!mapImage || !mapContainer) {
        console.error('No se encontró la imagen del mapa o su contenedor');
        return;
    }

    // Resetear transformaciones
    resetMapState();

    // Remover event listeners existentes
    removeEventListeners();

    // Configurar los botones de zoom
    setupZoomButtons();

    // Agregar event listeners para gestos táctiles
    mapContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    mapContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    mapContainer.addEventListener('touchend', handleTouchEnd);
    mapContainer.addEventListener('touchcancel', handleTouchEnd);

    // Agregar soporte para mouse wheel zoom
    mapContainer.addEventListener('wheel', handleWheel, { passive: false });

    console.log('Interacción del mapa inicializada');
}

function setupZoomButtons() {
    const zoomInBtn = document.getElementById('zoomInButton');
    const zoomOutBtn = document.getElementById('zoomOutButton');
    const resetBtn = document.getElementById('resetZoomButton');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            zoomMap(1.2);
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            zoomMap(0.8);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetMap();
        });
    }
}

// Función para manejar el zoom con el mouse wheel
function handleWheel(event) {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = currentScale * factor;
    
    if (newScale >= 0.5 && newScale <= 3) {
        currentScale = newScale;
        updateImageTransform(currentScale, translateX, translateY);
    }
}

function handleTouchStart(event) {
    // No prevenir el evento por defecto para los botones
    if (event.target.closest('.zoom-controls')) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    
    if (event.touches.length === 2) {
        // Pellizcar para zoom
        isZooming = true;
        isDragging = false;
        initialDistance = getDistance(event.touches[0], event.touches[1]);
        lastTouchDistance = initialDistance;
        console.log('Inicio de zoom con dos dedos');
    } else if (event.touches.length === 1) {
        // Arrastrar
        isZooming = false;
        isDragging = true;
        startX = event.touches[0].clientX - translateX;
        startY = event.touches[0].clientY - translateY;
        console.log('Inicio de arrastre');
    }
}

function handleTouchMove(event) {
    // No prevenir el evento por defecto para los botones
    if (event.target.closest('.zoom-controls')) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    
    if (event.touches.length === 2 && isZooming) {
        // Pellizcar para zoom
        const currentDistance = getDistance(event.touches[0], event.touches[1]);
        const scaleFactor = currentDistance / lastTouchDistance;
        
        const newScale = limitScale(currentScale * scaleFactor);
        if (newScale !== currentScale) {
            currentScale = newScale;
            updateImageTransform();
            console.log('Zoom actualizado:', currentScale);
        }
        lastTouchDistance = currentDistance;
    } else if (event.touches.length === 1 && isDragging) {
        // Arrastrar
        const touch = event.touches[0];
        translateX = touch.clientX - startX;
        translateY = touch.clientY - startY;
        updateImageTransform();
        console.log('Posición actualizada:', { x: translateX, y: translateY });
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
    isZooming = false;
    console.log('Gesto terminado');
}

function removeEventListeners() {
    if (!mapContainer) return;
    
    mapContainer.removeEventListener('touchstart', handleTouchStart);
    mapContainer.removeEventListener('touchmove', handleTouchMove);
    mapContainer.removeEventListener('touchend', handleTouchEnd);
    mapContainer.removeEventListener('touchcancel', handleTouchEnd);
    mapContainer.removeEventListener('wheel', handleWheel);
}

function resetMapState() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    isZooming = false;
    updateImageTransform();
}

function limitScale(scale) {
    return Math.min(Math.max(scale, 0.5), 3);
}

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateImageTransform() {
    if (mapImage) {
        mapImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
    }
}

// Funciones públicas para controlar el zoom
export function zoomMap(factor) {
    const newScale = currentScale * factor;
    if (newScale >= 0.5 && newScale <= 3) {
        currentScale = newScale;
        updateImageTransform(currentScale, translateX, translateY);
    }
}

export function resetMap() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform(currentScale, translateX, translateY);
}
