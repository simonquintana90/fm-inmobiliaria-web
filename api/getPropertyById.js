// api/getPropertyById.js
// VERSIÓN CORREGIDA - Usando el endpoint de BÚSQUEDA para máxima compatibilidad.

export default async function handler(request, response) {
  const ID_COMPANY = '14863247';
  const WASI_TOKEN = process.env.WASI_TOKEN;

  if (!WASI_TOKEN) {
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta.' });
  }

  // Obtenemos el 'id' de la propiedad desde la URL (ej: /api/getPropertyById?id=12345)
  const { id } = request.query;

  if (!id) {
    return response.status(400).json({ error: 'Falta el ID de la propiedad.' });
  }

  // AJUSTE: Usamos el endpoint "search" con el parámetro "id_property"
  const wasiApiUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id_property=${id}`;

  try {
    const apiResponse = await fetch(wasiApiUrl);

    // CORRECCIÓN: Se verifica si la respuesta de la API fue exitosa ANTES de intentar procesarla como JSON.
    // Esto previene el error 500 si WASI responde con un error.
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Error from Wasi API (getPropertyById):", apiResponse.status, apiResponse.statusText, errorText);
      throw new Error(`La API de Wasi respondió con un error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // La respuesta de "search" viene anidada en un objeto con la llave "0"
    const property = data && data['0'] ? data['0'] : null;

    if (!property) {
      return response.status(404).json({ error: 'Propiedad no encontrada.' });
    }
    
    // Devolvemos solo el objeto de la propiedad
    response.status(200).json(property);

  } catch (error) {
    console.error('Wasi API Function Error (getPropertyById):', error.message);
    response.status(500).json({ error: 'No se pudo obtener la propiedad.' });
  }
}
