/* Nuevo código para mapInteraction.js */

"use strict";

// Variables para el manejo de gestos
let initialDistance = 0;
let currentScale = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
let lastTouchDistance = 0;
let isZooming = false;

// Referencias a los elementos del mapa
let mapImage = null;
let mapContainer = null;

/**
 * Inicializa la interacción con el mapa: configura los eventos táctiles, de rueda y los botones de zoom.
 */
export function initializeMapInteraction() {
  mapImage = document.getElementById('propertyMapImage');
  mapContainer = document.querySelector('.map-container');
  if (!mapImage || !mapContainer) {
    console.error('No se encontró la imagen del mapa o su contenedor');
    return;
  }
  
  resetMapState();
  removeEventListeners();
  setupZoomButtons();
  
  // Configurar eventos sobre el contenedor
  mapContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
  mapContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
  mapContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
  mapContainer.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  mapContainer.addEventListener('wheel', handleWheel, { passive: false });
  
  console.log('Interacción del mapa inicializada');
}

/**
 * Configura los botones de zoom.
 */
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

/**
 * Maneja el evento de la rueda del mouse para hacer zoom.
 */
function handleWheel(event) {
  event.preventDefault();
  const factor = event.deltaY < 0 ? 1.1 : 0.9;
  zoomMap(factor);
}

/**
 * Maneja el inicio de un evento táctil.
 */
function handleTouchStart(event) {
  // Si el toque es en algún control de zoom, no procesarlo
  if (event.target.closest('.zoom-controls')) return;
  event.preventDefault();
  event.stopPropagation();
  
  if (event.touches.length === 2) {
    // Iniciar pellizco para zoom
    isZooming = true;
    isDragging = false;
    initialDistance = getDistance(event.touches[0], event.touches[1]);
    lastTouchDistance = initialDistance;
    console.log('Inicio de pellizco para zoom');
  } else if (event.touches.length === 1) {
    // Iniciar arrastre
    isZooming = false;
    isDragging = true;
    startX = event.touches[0].clientX - translateX;
    startY = event.touches[0].clientY - translateY;
    console.log('Inicio de arrastre');
  }
}

/**
 * Maneja el movimiento táctil para el zoom o arrastre.
 */
function handleTouchMove(event) {
  // Si el evento proviene de los botones de zoom, no procesarlo
  if (event.target.closest('.zoom-controls')) return;
  event.preventDefault();
  event.stopPropagation();
  
  if (event.touches.length === 2 && isZooming) {
    const currentDistance = getDistance(event.touches[0], event.touches[1]);
    const factor = currentDistance / lastTouchDistance;
    zoomMap(factor);
    lastTouchDistance = currentDistance;
  } else if (event.touches.length === 1 && isDragging) {
    const touch = event.touches[0];
    translateX = touch.clientX - startX;
    translateY = touch.clientY - startY;
    updateImageTransform();
    console.log('Arrastre:', { translateX, translateY });
  }
}

/**
 * Maneja el fin de un evento táctil.
 */
function handleTouchEnd(event) {
  event.preventDefault();
  event.stopPropagation();
  isDragging = false;
  isZooming = false;
  console.log('Gesto táctil finalizado');
}

/**
 * Calcula la distancia entre dos puntos táctiles.
 */
function getDistance(t1, t2) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Aplica un factor de zoom a la imagen del mapa.
 */
export function zoomMap(factor) {
  let newScale = currentScale * factor;
  newScale = limitScale(newScale);
  currentScale = newScale;
  updateImageTransform();
  console.log('Nuevo zoom:', currentScale);
}

/**
 * Reinicia el zoom y la posición del mapa.
 */
export function resetMap() {
  resetMapState();
  updateImageTransform();
  console.log('Mapa reseteado');
}

/**
 * Actualiza la transformación CSS de la imagen del mapa.
 */
function updateImageTransform() {
  if (mapImage) {
    mapImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
  }
}

/**
 * Remueve los event listeners del contenedor del mapa.
 */
function removeEventListeners() {
  if (!mapContainer) return;
  mapContainer.removeEventListener('touchstart', handleTouchStart);
  mapContainer.removeEventListener('touchmove', handleTouchMove);
  mapContainer.removeEventListener('touchend', handleTouchEnd);
  mapContainer.removeEventListener('touchcancel', handleTouchEnd);
  mapContainer.removeEventListener('wheel', handleWheel);
}

/**
 * Resetea el estado interno del mapa.
 */
function resetMapState() {
  currentScale = 1;
  translateX = 0;
  translateY = 0;
  isDragging = false;
  isZooming = false;
}

/**
 * Limita el nivel de zoom entre 0.5x y 3x.
 */
function limitScale(scale) {
  return Math.min(Math.max(scale, 0.5), 3);
}
