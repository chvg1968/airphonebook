// Funciones para manejar los modales
export function openMapModal() {
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Inicializar el zoom
        const mapImage = document.getElementById('mapImage');
        if (mapImage) {
            mapImage.style.transform = 'scale(1)';
        }
    }
}

export function closeMapModal() {
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Funciones para el zoom del mapa
export function zoomMap(factor) {
    const mapImage = document.getElementById('mapImage');
    if (mapImage) {
        const currentScale = mapImage.style.transform ? 
            parseFloat(mapImage.style.transform.replace('scale(', '').replace(')', '')) : 1;
        const newScale = currentScale * factor;
        
        // Limitar el zoom entre 0.5 y 3
        if (newScale >= 0.5 && newScale <= 3) {
            mapImage.style.transform = `scale(${newScale})`;
        }
    }
}

export function resetMap() {
    const mapImage = document.getElementById('mapImage');
    if (mapImage) {
        mapImage.style.transform = 'scale(1)';
    }
}

// Golf Cart Modal
export function openGolfCartModal() {
    const modal = document.getElementById('golfCartModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

export function closeGolfCartModal() {
    const modal = document.getElementById('golfCartModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Golf Rates Modal
export function openGolfRatesModal() {
    const modal = document.getElementById('golfRatesModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

export function closeGolfRatesModal() {
    const modal = document.getElementById('golfRatesModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Tennis Modal
export function openTennisModal() {
    const modal = document.getElementById('tennisModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

export function closeTennisModal() {
    const modal = document.getElementById('tennisModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cerrar los modales cuando se hace clic fuera de ellos
// Kids Club Modal
export function openKidsClubModal() {
    const modal = document.getElementById('kidsClubModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

export function closeKidsClubModal() {
    const modal = document.getElementById('kidsClubModal');
    if (modal) {
        modal.style.display = 'none';
    }
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
