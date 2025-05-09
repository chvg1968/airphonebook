import { villas } from '../../../properties.js';

// Función principal que maneja la carga de la página
export async function initializeProperty() {
    try {
        console.log('Iniciando renderizado de propiedad...');
        
        // 1. Obtener datos de la propiedad
        const urlParams = new URLSearchParams(window.location.search);
        const propertyKey = decodeURIComponent(urlParams.get('property'));
        console.log('Llave de propiedad:', propertyKey);

        if (!propertyKey || !villas[propertyKey]) {
            console.error('Propiedad no encontrada en villas:', Object.keys(villas));
            throw new Error('Propiedad no encontrada');
        }

        const propertyData = villas[propertyKey];
        console.log('Datos de la propiedad:', propertyData);

        // 2. Obtener elementos del DOM
        const welcomeSection = document.querySelector('.property-welcome');
        console.log('Sección de bienvenida encontrada:', !!welcomeSection);

        if (!welcomeSection) {
            throw new Error('Sección de bienvenida no encontrada');
        }

        // Obtener y verificar elementos
        const propertyImage = welcomeSection.querySelector('.property-image');
        console.log('Imagen encontrada:', !!propertyImage);

        const propertyTitle = welcomeSection.querySelector('#propertyTitle');
        console.log('Título encontrado:', !!propertyTitle);

        const accommodationInfo = welcomeSection.querySelector('h3');
        console.log('Info de acomodación encontrada:', !!accommodationInfo);

        // 3. Actualizar contenido
        console.log('Actualizando contenido...');

        // 3.1 Título de la página
        document.title = propertyData.property_title;
        console.log('Título de página actualizado:', document.title);

        // 3.2 Imagen
        if (propertyImage) {
            propertyImage.src = propertyData.image;
            propertyImage.alt = propertyData.property_title;
            console.log('Imagen actualizada:', propertyImage.src);
        } else {
            console.error('No se encontró el elemento de imagen');
        }

        // 3.3 Título principal
        if (propertyTitle) {
            propertyTitle.textContent = propertyData.property_title;
            console.log('Título principal actualizado:', propertyTitle.textContent);
        } else {
            console.error('No se encontró el elemento de título');
        }

        // 3.4 Información de acomodación
        if (accommodationInfo && propertyData['Property Information']?.Accomodation) {
            const [bedrooms, type] = propertyData['Property Information'].Accomodation.split('<br>');
            accommodationInfo.textContent = bedrooms.trim();
            
            // Si hay un segundo h3, actualizarlo con el tipo
            const secondH3 = welcomeSection.querySelectorAll('h3')[1];
            if (secondH3 && type) {
                // Extraer solo la parte de los huéspedes si existe
                const guestMatch = type.match(/(.+?)(?:\s*-\s*(\d+)\s*Guests)?$/i);
                if (guestMatch) {
                    const [_, propertyType, guests] = guestMatch;
                    secondH3.textContent = `${propertyType.trim()}${guests ? ` - ${guests} Guests` : ''}`;
                } else {
                    secondH3.textContent = type.trim();
                }
            }
            
            console.log('Acomodación actualizada:', bedrooms.trim(), type?.trim());
        } else {
            console.error('No se pudo actualizar la acomodación:', {
                'elemento h3 existe': !!accommodationInfo,
                'datos de acomodación existen': !!propertyData['Property Information']?.Accomodation
            });
        }

        // 4. Actualizar información de WiFi y Parking
        const updateSection = (sectionTitle, data) => {
            if (!data) return;

            // Encontrar la sección
            const section = Array.from(document.querySelectorAll('.info-group'))
                .find(group => group.querySelector('h3')?.textContent.trim() === sectionTitle);

            if (!section) {
                console.error(`Sección no encontrada: ${sectionTitle}`);
                return;
            }

            // Obtener o crear la lista
            let ul = section.querySelector('ul.info-list');
            if (!ul) {
                ul = document.createElement('ul');
                ul.className = 'info-list';
                ul.style.listStyle = 'none';
                section.appendChild(ul);
            }

            // Actualizar contenido
            const items = Object.entries(data)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                .join('');

            ul.innerHTML = items;
            console.log(`${sectionTitle} actualizado:`, data);
        };

        // Actualizar WiFi y Parking
        updateSection('Wifi Information', propertyData['Wifi Information']);
        updateSection('Parking Information', propertyData['Parking Information']);

        console.log('Propiedad actualizada completamente');
    } catch (error) {
        console.error('Error en initializeProperty:', error);
    }
}
