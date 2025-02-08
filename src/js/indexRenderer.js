import { villas } from '../../properties.js';

function createPropertyCard(propertyKey, propertyData) {
    return `
        <a href="/src/html/pages/model.html?property=${encodeURIComponent(propertyKey)}" class="property-card">
            <img src="${propertyData.image}" alt="${propertyData.property_title}" class="property-image">
            <div class="property-info">
                <h2 class="property-name">${propertyData.property_title}</h2>
                <p class="property-description">${propertyData['Property Information']['Accomodation']}</p>
                <div class="property-cta">
                    View Directory <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        </a>
    `;
}

function renderProperties() {
    const propertiesGrid = document.querySelector('.properties-grid');
    if (!propertiesGrid) {
        console.error('No se encontró el contenedor .properties-grid');
        return;
    }

    propertiesGrid.innerHTML = '';
    
    Object.entries(villas).forEach(([key, property]) => {
        propertiesGrid.innerHTML += createPropertyCard(key, property);
    });
}



document.addEventListener('DOMContentLoaded', renderProperties);
