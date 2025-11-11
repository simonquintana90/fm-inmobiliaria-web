// api/getAllProperties.js
// VERSIÓN MEJORADA 2.0 - Paginación dinámica robusta.

export default async function handler(request, response) {
  const ID_COMPANY = '14863247';
  const WASI_TOKEN = process.env.WASI_TOKEN;

  if (!WASI_TOKEN) {
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta.' });
  }

  // Función para obtener todas las propiedades usando paginación dinámica y robusta
  const fetchAllWasiProperties = async () => {
    const limit = 50; // El máximo permitido por la documentación de Wasi

    // 1. Hacemos una primera llamada con el límite completo para obtener un conteo total más fiable
    const firstPageUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id_country=1&limit=${limit}&skip=0`;
    const firstPageResponse = await fetch(firstPageUrl);

    if (!firstPageResponse.ok) {
        const errorText = await firstPageResponse.text();
        console.error("Error fetching first page of properties from Wasi:", firstPageResponse.status, errorText);
        throw new Error('No se pudo obtener la primera página de propiedades.');
    }
    
    const firstPageData = await firstPageResponse.json();
    const totalProperties = firstPageData.total;

    if (!totalProperties || totalProperties === 0) {
        return []; // No hay propiedades para obtener
    }

    // Extraemos las propiedades de la primera página
    const firstPageProperties = Object.keys(firstPageData)
        .filter(key => !isNaN(parseInt(key)))
        .map(key => firstPageData[key]);
    
    let allProperties = [...firstPageProperties];

    // 2. Calculamos si se necesitan más páginas
    const totalPagesToFetch = Math.ceil(totalProperties / limit);
    
    if (totalPagesToFetch > 1) {
        const pagePromises = [];
        // Empezamos desde la página 2 (índice 1)
        for (let i = 1; i < totalPagesToFetch; i++) {
            const skipValue = i * limit;
            const url = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id_country=1&limit=${limit}&skip=${skipValue}`;
            
            pagePromises.push(
                fetch(url).then(async (res) => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error(`Error fetching page ${i + 1}/${totalPagesToFetch}:`, res.status, errorText);
                        return { wasi_request_failed: true }; // Marcador de error
                    }
                    return res.json();
                })
            );
        }

        // 3. Ejecutamos las peticiones restantes en paralelo
        const remainingPagesResults = await Promise.all(pagePromises);

        // 4. Procesamos y unimos los resultados
        for (const pageData of remainingPagesResults) {
            if (pageData && !pageData.wasi_request_failed) {
                const pageProperties = Object.keys(pageData)
                    .filter(key => !isNaN(parseInt(key)))
                    .map(key => pageData[key]);
                
                if (pageProperties.length > 0) {
                    allProperties.push(...pageProperties);
                }
            }
        }
    }

    return allProperties;
  };

  try {
    const allProperties = await fetchAllWasiProperties();
    // Eliminamos duplicados por si la API repite alguno entre páginas
    const uniqueProperties = Array.from(new Map(allProperties.map(prop => [prop.id_property, prop])).values());

    // Obtenemos los tipos de inmueble para los filtros
    const propertyTypesUrl = `https://api.wasi.co/v1/property-type/all?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}`;
    const typesRes = await fetch(propertyTypesUrl);
    
    if (!typesRes.ok) {
        const errorText = await typesRes.text();
        console.error("Error fetching property types:", typesRes.status, errorText);
        throw new Error('No se pudieron obtener los tipos de propiedad.');
    }
    const typesData = await typesRes.json();
    
    const cities = [...new Set(uniqueProperties.map(p => p.city_label).filter(Boolean))];
    const propertyTypes = typesData.property_types || [];
    
    // Unimos la información para una respuesta completa
    const propertiesWithTypes = uniqueProperties.map(prop => {
        const propType = propertyTypes.find(t => t.id_property_type === prop.id_property_type);
        return {
            ...prop,
            property_type: { name: propType ? propType.name : 'No especificado' }
        };
    });

    response.status(200).json({
        properties: propertiesWithTypes,
        cities,
        propertyTypes
    });

  } catch (error) {
    console.error('Error en la función getAllProperties:', error.message);
    response.status(500).json({ error: 'No se pudieron obtener los datos de las propiedades.' });
  }
}