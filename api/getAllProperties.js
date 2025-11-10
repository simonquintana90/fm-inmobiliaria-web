// api/getAllProperties.js
// VERSIÓN DEFINITIVA - Usando el parámetro correcto "skip" de la documentación.

module.exports = async function handler(request, response) {
  const ID_COMPANY = '14863247';
  const WASI_TOKEN = process.env.WASI_TOKEN;

  if (!WASI_TOKEN) {
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta.' });
  }

  // Función para obtener todas las propiedades usando "skip"
  const fetchAllWasiProperties = async () => {
    let allProperties = [];
    const limit = 50; // El máximo permitido por la documentación de Wasi
    const totalPagesToFetch = 5; // Pediremos 5 páginas de 50 (cubre 250 propiedades)
    
    // Creamos un array de promesas, una por cada página que queremos pedir
    const pagePromises = [];
    for (let i = 0; i < totalPagesToFetch; i++) {
      const skipValue = i * limit;
      const url = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id_country=1&limit=${limit}&skip=${skipValue}`;
      
      // Añadimos la petición fetch al array de promesas
      pagePromises.push(fetch(url).then(res => res.json()));
    }

    // Ejecutamos todas las peticiones en paralelo para máxima velocidad
    const allPagesResults = await Promise.all(pagePromises);

    // Procesamos los resultados de todas las páginas
    for (const pageData of allPagesResults) {
      if (pageData && pageData.status !== 'error') {
        const pageProperties = Object.keys(pageData)
          .filter(key => !isNaN(parseInt(key))) // Filtra solo por llaves numéricas
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
    // Eliminamos duplicados por si la API repite alguno
    const uniqueProperties = Array.from(new Map(allProperties.map(prop => [prop.id_property, prop])).values());

    // Obtenemos los tipos de inmueble para los filtros
    const propertyTypesUrl = `https://api.wasi.co/v1/property-type/all?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}`;
    const typesRes = await fetch(propertyTypesUrl);
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
    console.error('Error en la función getAllProperties:', error);
    response.status(500).json({ error: 'No se pudieron obtener los datos de las propiedades.' });
  }
}
