// api/getPropertyById.js

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

  // Usamos el endpoint "get" de Wasi, que es específico para obtener una propiedad por ID.
  const wasiApiUrl = `https://api.wasi.co/v1/property/get?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&id=${id}`;

  try {
    const apiResponse = await fetch(wasiApiUrl);

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("Error from Wasi API (getPropertyById):", errorData);
      throw new Error(errorData.message || 'Error en la API de Wasi');
    }

    const propertyData = await apiResponse.json();

    if (!propertyData || propertyData.status === 'error') {
        return response.status(404).json({ error: 'Propiedad no encontrada.' });
    }

    // Devolvemos la información completa de la propiedad
    response.status(200).json(propertyData);

  } catch (error) {
    console.error('Wasi API Function Error (getPropertyById):', error);
    response.status(500).json({ error: 'No se pudo obtener la propiedad.' });
  }
}