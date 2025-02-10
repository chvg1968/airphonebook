// Variables para el manejo de gestos táctiles
let initialDistance = 0;
let currentScale = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// Función para inicializar la interacción con el mapa
export function initializeMapInteraction() {
    const mapImage = document.getElementById('propertyMapImage');
    if (!mapImage) return;

    // Resetear transformaciones
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform(currentScale, translateX, translateY);

    // Agregar event listeners para gestos táctiles
    mapImage.addEventListener('touchstart', handleTouchStart, { passive: false });
    mapImage.addEventListener('touchmove', handleTouchMove, { passive: false });
    mapImage.addEventListener('touchend', handleTouchEnd);

    // Agregar soporte para mouse wheel zoom
    mapImage.addEventListener('wheel', handleWheel, { passive: false });
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
    event.preventDefault();
    
    if (event.touches.length === 2) {
        // Pellizcar para zoom
        initialDistance = getDistance(event.touches[0], event.touches[1]);
    } else if (event.touches.length === 1) {
        // Arrastrar
        isDragging = true;
        startX = event.touches[0].clientX - translateX;
        startY = event.touches[0].clientY - translateY;
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    
    if (event.touches.length === 2) {
        // Pellizcar para zoom
        const currentDistance = getDistance(event.touches[0], event.touches[1]);
        const scaleFactor = currentDistance / initialDistance;
        
        const newScale = currentScale * scaleFactor;
        if (newScale >= 0.5 && newScale <= 3) {
            updateImageTransform(newScale, translateX, translateY);
            currentScale = newScale;
        }
        initialDistance = currentDistance;
    } else if (event.touches.length === 1 && isDragging) {
        // Arrastrar
        const touch = event.touches[0];
        translateX = touch.clientX - startX;
        translateY = touch.clientY - startY;
        updateImageTransform(currentScale, translateX, translateY);
    }
}

function handleTouchEnd() {
    isDragging = false;
}

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateImageTransform(scale, x, y) {
    const mapImage = document.getElementById('propertyMapImage');
    if (mapImage) {
        mapImage.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
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
