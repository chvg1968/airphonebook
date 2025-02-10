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
    // Inicializar el zoom
    const mapImage = document.getElementById('mapImage');
    if (mapImage) {
        mapImage.style.transform = 'scale(1)';
    }
}

export function closeMapModal() {
    hideModal('mapModal');
}

// Funciones para el zoom del mapa
export function zoomMap(factor) {
    const mapImage = document.getElementById('propertyMapImage');
    if (mapImage) {
        const currentScale = mapImage.style.transform ? 
            parseFloat(mapImage.style.transform.replace('scale(', '').replace(')', '')) : 1;
        const newScale = currentScale * factor;
        
        // Limitar el zoom entre 0.5 y 3
        if (newScale >= 0.5 && newScale <= 3) {
            mapImage.style.transform = `scale(${newScale})`;
            console.log('Zoom aplicado:', newScale);
        }
    } else {
        console.error('Elemento propertyMapImage no encontrado');
    }
}

export function resetMap() {
    const mapImage = document.getElementById('propertyMapImage');
    if (mapImage) {
        mapImage.style.transform = 'scale(1)';
        console.log('Zoom reseteado');
    } else {
        console.error('Elemento propertyMapImage no encontrado');
    }
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
