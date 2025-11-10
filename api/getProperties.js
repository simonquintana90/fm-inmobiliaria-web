// Este archivo debe estar en una carpeta llamada "api" en la raíz de tu proyecto.
// Vercel lo detectará automáticamente como una Serverless Function.

module.exports = async function handler(request, response) {
  // Estos son tus datos. El token se lee de forma segura desde las variables de entorno de Vercel.
  const ID_COMPANY = '14863247'; // Tu ID de compañía de Wasi
  const WASI_TOKEN = process.env.WASI_TOKEN;

  // Verificación para asegurarnos de que el token existe en Vercel.
  if (!WASI_TOKEN) {
    console.error("Error Crítico: La variable de entorno WASI_TOKEN no está configurada en Vercel.");
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta. Falta el token de API.' });
  }

  // Pedimos 6 propiedades a Wasi.
  const wasiApiUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&limit=6`;

  try {
    const apiResponse = await fetch(wasiApiUrl);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
        console.error("Error from Wasi API:", data);
        throw new Error(data.message || 'Error en la API de Wasi');
    }

    // La API de Wasi devuelve un objeto donde las propiedades son llaves numéricas ("0", "1", etc.).
    // Convertimos este objeto en una lista (array) para que nuestra página pueda leerlo.
    let properties = [];
    if (data && data.total > 0) {
      properties = Object.keys(data)
        .filter(key => !isNaN(parseInt(key))) // Nos aseguramos de tomar solo las llaves numéricas
        .map(key => data[key]);
    }
    
    // AJUSTE DEFINITIVO: Nos aseguramos de devolver solo 6 propiedades, sin importar lo que envíe Wasi.
    const limitedProperties = properties.slice(0, 6);
    
    response.status(200).json(limitedProperties);

  } catch (error) {
    console.error('Wasi API Function Error:', error);
    response.status(500).json({ error: 'No se pudieron obtener las propiedades.' });
  }
}
