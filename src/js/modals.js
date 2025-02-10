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

export function openMapModal() {
    showModal('mapModal');
    setTimeout(initializeImage, 100);
}

function initializeImage() {
    const container = document.getElementById('mapContainer');
    const image = document.getElementById('propertyMapImage');
    if (!container || !image) return;

    // Asegurar que la imagen tenga su tamaño natural
    image.style.width = 'auto';
    image.style.height = 'auto';

    // Ajustar el tamaño inicial para que quepa en el contenedor
    const containerRatio = container.clientWidth / container.clientHeight;
    const imageRatio = image.naturalWidth / image.naturalHeight;

    if (imageRatio > containerRatio) {
        // La imagen es más ancha que el contenedor
        image.style.width = '100%';
        image.style.height = 'auto';
    } else {
        // La imagen es más alta que el contenedor
        image.style.height = '100%';
        image.style.width = 'auto';
    }
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
