import { villas } from '../../properties.js';

function createPropertyCard(propertyKey, propertyData) {
    return `
        <div class="property-item">
            <div class="property-header">
                <img src="${propertyData.image}" alt="${propertyData.property_title}" class="property-image">
                <div class="property-info">
                    <h2 class="property-title">${propertyData.property_title}</h2>
                    <p class="property-description">
                        ${propertyData['Property Information']['Accomodation']}
                    </p>
                    <a href="/src/html/pages/model.html?property=${encodeURIComponent(propertyKey)}" class="view-details-btn">
                        <i class="fas fa-info-circle"></i> Ver detalles completos
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderProperties() {
    const propertiesAccordion = document.getElementById('propertiesAccordion');
    if (!propertiesAccordion) return;

    propertiesAccordion.innerHTML = '';
    
    Object.entries(villas).forEach(([key, property]) => {
        propertiesAccordion.innerHTML += createPropertyAccordionItem(key, property);
    });
}

window.toggleProperty = function(header) {
    const content = header.nextElementSibling;
    const isActive = content.classList.contains('active');
    
    // Cerrar todos los acordeones abiertos
    document.querySelectorAll('.property-content.active').forEach(item => {
        item.classList.remove('active');
    });

    // Abrir/cerrar el acordeón seleccionado
    if (!isActive) {
        content.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', renderProperties);
