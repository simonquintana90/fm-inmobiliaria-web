// api/getPropertyById.js

export default async function handler(request, response) {
  const ID_COMPANY = '14863247'; // Tu ID de compañía de Wasi
  const WASI_TOKEN = process.env.WASI_TOKEN;

  // Verificación para asegurarnos de que el token existe en Vercel.
  if (!WASI_TOKEN) {
    console.error("Error Crítico: La variable de entorno WASI_TOKEN no está configurada en Vercel.");
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta. Falta el token de API.' });
  }

  // Obtenemos el ID de la propiedad de los parámetros de la URL
  const { id_property } = request.query;

  if (!id_property) {
    return response.status(400).json({ error: 'Falta el ID de la propiedad.' });
  }

  // Construimos la URL de la API de Wasi para buscar por ID
  const wasiApiUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id_property=${id_property}`;

  try {
    const apiResponse = await fetch(wasiApiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("Error from Wasi API (getPropertyById):", errorData);
      throw new Error(errorData.message || 'Error en la API de Wasi al buscar propiedad por ID');
    }

    const data = await apiResponse.json();

    // La API de Wasi devuelve un objeto donde la propiedad es una llave numérica (si se encontró una).
    // Tomamos la primera propiedad encontrada, si existe.
    let property = null;
    if (data && data.total > 0) {
      // Intentamos encontrar la propiedad directamente por su ID si la API la envuelve
      const foundProperty = Object.values(data).find(item => item && item.id_property === id_property);
      property = foundProperty || data['0']; // O tomamos la primera si no la encontramos por el find.
    }

    if (!property) {
      return response.status(404).json({ error: 'Propiedad no encontrada.' });
    }

    response.status(200).json(property);

  } catch (error) {
    console.error('Wasi API Function Error (getPropertyById):', error);
    response.status(500).json({ error: 'No se pudo obtener la propiedad.' });
  }
}