// api/getAllProperties.js
// VERSIÓN MEJORADA - Paginación dinámica para obtener TODAS las propiedades.

export default async function handler(request, response) {
  const ID_COMPANY = '14863247';
  const WASI_TOKEN = process.env.WASI_TOKEN;

  if (!WASI_TOKEN) {
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta.' });
  }

  // Función para obtener todas las propiedades usando paginación dinámica
  const fetchAllWasiProperties = async () => {
    const limit = 50; // El máximo permitido por la documentación de Wasi

    // 1. Hacemos una primera llamada para saber el total de propiedades
    const initialUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id_country=1&limit=1`;
    const initialResponse = await fetch(initialUrl);

    if (!initialResponse.ok) {
        const errorText = await initialResponse.text();
        console.error("Error fetching initial property count from Wasi:", initialResponse.status, errorText);
        throw new Error('No se pudo obtener el conteo total de propiedades.');
    }
    
    const initialData = await initialResponse.json();
    const totalProperties = initialData.total;

    if (!totalProperties || totalProperties === 0) {
        return []; // No hay propiedades para obtener
    }

    // 2. Calculamos cuántas páginas necesitamos para obtener todo
    const totalPagesToFetch = Math.ceil(totalProperties / limit);
    
    const pagePromises = [];
    for (let i = 0; i < totalPagesToFetch; i++) {
      const skipValue = i * limit;
      const url = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id_country=1&limit=${limit}&skip=${skipValue}`;
      
      pagePromises.push(
        fetch(url).then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error fetching page ${i + 1}/${totalPagesToFetch}:`, res.status, errorText);
            return { wasi_request_failed: true }; // Marcador de error para no romper Promise.all
          }
          return res.json();
        })
      );
    }

    // 3. Ejecutamos todas las peticiones en paralelo para máxima velocidad
    const allPagesResults = await Promise.all(pagePromises);

    // 4. Procesamos y unimos los resultados de todas las páginas
    let allProperties = [];
    for (const pageData of allPagesResults) {
      if (pageData && !pageData.wasi_request_failed) {
        const pageProperties = Object.keys(pageData)
          .filter(key => !isNaN(parseInt(key))) // Filtramos solo por llaves numéricas
          .map(key => pageData[key]);
        
        if (pageProperties.length > 0) {
          allProperties.push(...pageProperties);
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