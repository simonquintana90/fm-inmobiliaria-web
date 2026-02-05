// Este archivo debe estar en una carpeta llamada "api" en la raíz de tu proyecto.
// Vercel lo detectará automáticamente como una Serverless Function.

export default async function handler(request, response) {
  // Estos son tus datos. El token se lee de forma segura desde las variables de entorno de Vercel.
  const ID_COMPANY = '14863247'; // Tu ID de compañía de Wasi
  const WASI_TOKEN = process.env.WASI_TOKEN;

  // Verificación para asegurarnos de que el token existe en Vercel.
  if (!WASI_TOKEN) {
    console.error("Error Crítico: La variable de entorno WASI_TOKEN no está configurada en Vercel.");
    return response.status(500).json({ error: 'La configuración del servidor es incorrecta. Falta el token de API.' });
  }

  // Set Cache-Control header for 10 minutes (600 seconds)
  response.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');

  // Pedimos 6 propiedades a Wasi.
  const wasiApiUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&limit=6`;

  try {
    const apiResponse = await fetch(wasiApiUrl);

    // CORRECCIÓN: Se verifica si la respuesta de la API fue exitosa ANTES de intentar procesarla como JSON.
    // Esto previene el error 500 si WASI responde con un error (ej. HTML o texto simple).
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text(); // Leemos el error como texto para un debug seguro.
      console.error("Error from Wasi API:", apiResponse.status, apiResponse.statusText, errorText);
      throw new Error(`La API de Wasi respondió con un error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

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
    console.error('Wasi API Function Error:', error.message);
    response.status(500).json({ error: 'No se pudieron obtener las propiedades.' });
  }
}
