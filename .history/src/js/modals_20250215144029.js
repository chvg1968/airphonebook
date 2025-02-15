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

// Exponer funciones de zoom globalmente
window.zoomIn = function() {
    if (panzoomInstance) {
        const currentScale = panzoomInstance.getScale();
        const newScale = Math.min(currentScale * 1.2, 4);
        panzoomInstance.zoom(newScale, { 
            animate: true,
            duration: 250
        });
        
        // Centrar la imagen si está en escala 1 o menor
        if (currentScale <= 1) {
            panzoomInstance.pan(0, 0);
        }
    }
};

window.zoomOut = function() {
    if (panzoomInstance) {
        const currentScale = panzoomInstance.getScale();
        const newScale = Math.max(currentScale * 0.8, 1);
        panzoomInstance.zoom(newScale, { 
            animate: true,
            duration: 250
        });
    }
};

window.resetZoom = function() {
    if (panzoomInstance) {
        panzoomInstance.reset({ animate: true });
    }
};

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
    const image = document.querySelector('.panzoom');
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

    const img = container.querySelector('.panzoom');

    // Inicializar Panzoom con opciones mejoradas
    panzoomInstance = Panzoom(img, {
        maxScale: 4,
        minScale: 0.5,
        contain: 'outside',
        startScale: 1,
        animate: true,
        duration: 250,
        easing: 'ease-out'
    });

    // Habilitar el zoom y pan en la imagen
    img.parentElement.addEventListener('panzoomstart', (event) => {
        event.preventDefault();
    });

    img.parentElement.addEventListener('panzoomend', () => {
        const scale = panzoomInstance.getScale();
        if (scale <= 1) {
            panzoomInstance.pan(0, 0);
        }
    });

    // Mouse wheel zoom
    img.addEventListener('wheel', function(event) {
        event.preventDefault();
        const delta = event.deltaY;
        const scale = panzoomInstance.getScale();
        const newScale = delta > 0 ? scale * 0.9 : scale * 1.1;

        if (newScale >= 0.5 && newScale <= 4) {
            panzoomInstance.zoom(newScale, {
                animate: true,
                focal: {
                    x: event.clientX,
                    y: event.clientY
                }
            });
        }
    });

    // Habilitar el arrastre en la imagen
    container.addEventListener('mousedown', function(e) {
        if (panzoomInstance.getScale() > 1) {
            container.style.cursor = 'grabbing';
        }
    });

    container.addEventListener('mouseup', function() {
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseleave', function() {
        container.style.cursor = 'grab';
    });

    // Gestos táctiles
    container.addEventListener('touchstart', () => {
        container.style.cursor = 'grabbing';
    });

    container.addEventListener('touchend', () => {
        container.style.cursor = 'grab';
    });

    // Eventos del mouse
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

// Golf Cart Modals
export function openGolfCartModalInfo() {
    showModal('golfCartModalinfo');
    // Configurar el botón de cierre
    const closeBtn = document.querySelector('#golfCartModalinfo .close');
    if (closeBtn) {
        closeBtn.onclick = closeGolfCartModalInfo;
    }
}

export function closeGolfCartModalInfo() {
    hideModal('golfCartModalinfo');
}

export function openGolfCartModalRules() {
    showModal('golfCartModalrules');
    // Configurar el botón de cierre
    const closeBtn = document.querySelector('#golfCartModalrules .close');
    if (closeBtn) {
        closeBtn.onclick = closeGolfCartModalRules;
    }
}

export function closeGolfCartModalRules() {
    hideModal('golfCartModalrules');
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

// Grocery Shopping Modal
export function openGroceryShoppingModal() {
    showModal('groceryShoppingModal');
}

export function closeGroceryShoppingModal() {
    hideModal('groceryShoppingModal');
}

// Cerrar los modales cuando se hace clic fuera de ellos
window.addEventListener('click', (event) => {
    const mapModal = document.getElementById('mapModal');
    const golfCartModalInfo = document.getElementById('golfCartModalinfo');
    const golfCartModalRules = document.getElementById('golfCartModalrules');
    const golfRatesModal = document.getElementById('golfRatesModal');
    const tennisModal = document.getElementById('tennisModal');
    const kidsClubModal = document.getElementById('kidsClubModal');
    const groceryShoppingModal = document.getElementById('groceryShoppingModal');
    const cleaningFeesModal = document.getElementById('cleaningFeesModal');

    if (event.target === mapModal) {
        closeMapModal();
    }
    if (event.target === golfCartModalInfo) {
        closeGolfCartModalInfo();
    } else if (event.target === golfCartModalRules) {
        closeGolfCartModalRules();
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
    if (event.target === groceryShoppingModal) {
        closeGroceryShoppingModal();
    }
});


