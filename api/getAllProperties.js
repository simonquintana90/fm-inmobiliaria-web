// api/getAllProperties.js
// VERSIÓN 5.0 - Ajustando el límite de paginación para que coincida con el comportamiento de la API.

export default async function handler(request, response) {
  const ID_COMPANY = '14863247';
  const WASI_TOKEN = process.env.WASI_TOKEN;

  if (!WASI_TOKEN) {
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta.' });
  }

  // Set Cache-Control header for 10 minutes (600 seconds)
  response.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');

  // Función para obtener TODAS las propiedades de la compañía, sin filtros.
  const fetchAllWasiProperties = async () => {
    let allProperties = [];
    let skip = 0;
    // AJUSTE CLAVE: La API de Wasi, al usar `status=4`, parece tener un límite
    // de respuesta de 10 inmuebles. Para paginar correctamente, debemos usar
    // un `limit` de 10 en nuestras peticiones y en nuestra lógica de parada.
    const limit = 10;
    let keepFetching = true;

    while (keepFetching) {
      // Se mantiene `&status=4` y se ajusta `limit=10`.
      const url = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&limit=${limit}&skip=${skip}&status=4`;

      const apiResponse = await fetch(url);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Error fetching page with skip=${skip}:`, apiResponse.status, errorText);
        // Detenemos el proceso si hay un error para evitar bucles infinitos.
        break;
      }

      const pageData = await apiResponse.json();

      const pageProperties = Object.keys(pageData)
        .filter(key => !isNaN(parseInt(key)))
        .map(key => pageData[key]);

      if (pageProperties.length > 0) {
        allProperties.push(...pageProperties);
      }

      // Condición de parada: Si la API devuelve MENOS de 10 propiedades,
      // significa que es la última página. Si devuelve exactamente 10, continuamos.
      if (pageProperties.length < limit) {
        keepFetching = false;
      } else {
        skip += limit;
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
      // No lanzamos un error fatal, podemos continuar sin los nombres de tipo si falla.
    }
    const typesData = typesRes.ok ? await typesRes.json() : { property_types: [] };

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