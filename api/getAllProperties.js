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
    const limit = 10; // Wasiforces limit=10 with status=4

    // 1. Fetch first page to get 'total' and first batch
    const firstUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&limit=${limit}&skip=0&status=4`;

    try {
      const firstRes = await fetch(firstUrl);
      if (!firstRes.ok) throw new Error('Failed to fetch first page');

      const firstData = await firstRes.json();
      const total = firstData.total || 0;

      // Extract properties from first page
      const firstPageProps = Object.keys(firstData)
        .filter(key => !isNaN(parseInt(key)))
        .map(key => firstData[key]);

      allProperties.push(...firstPageProps);

      // 2. Calculate remaining fetches
      if (total > limit) {
        const promises = [];
        // Start from skip=10 (limit), up to total
        for (let skip = limit; skip < total; skip += limit) {
          const url = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&limit=${limit}&skip=${skip}&status=4`;
          promises.push(
            fetch(url).then(async (res) => {
              if (!res.ok) return [];
              const data = await res.json();
              return Object.keys(data)
                .filter(key => !isNaN(parseInt(key)))
                .map(key => data[key]);
            })
          );
        }

        // 3. Execute all remaining fetches in parallel
        const results = await Promise.all(promises);
        results.forEach(props => allProperties.push(...props));
      }

    } catch (err) {
      console.error('Error fetching Wasi properties:', err);
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
    const typesData = typesRes.ok ? await typesRes.json() : {};

    // Wasi API returns objects with numeric keys, not arrays.
    const propertyTypes = Object.keys(typesData)
      .filter(key => !isNaN(parseInt(key))) // Filter only numeric keys
      .map(key => typesData[key]); // Extract the object

    const cities = [...new Set(uniqueProperties.map(p => p.city_label).filter(Boolean))];

    // Unimos la información para una respuesta completa
    const propertiesWithTypes = uniqueProperties.map(prop => {
      // Wasi properties usually come with id_property_type. 
      // Sometimes checking type id string vs number is needed.
      const propType = propertyTypes.find(t => String(t.id_property_type) === String(prop.id_property_type));
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