
import { Property, AllPropertiesResponse } from '../types';

const API_BASE = '/api';

const CACHE_KEY_FEATURED = 'wasi_featured_properties';
const CACHE_KEY_ALL = 'wasi_all_properties_v2';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const getFromCache = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (e) {
    console.error('Error reading from cache', e);
    return null;
  }
};

const saveToCache = <T>(key: string, data: T) => {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.warn('Error saving to cache', e);
  }
};

export const wasiService = {
  getFeaturedProperties: async (): Promise<Property[]> => {
    // Check cache first
    const cached = getFromCache<Property[]>(CACHE_KEY_FEATURED);
    if (cached) return cached;

    const response = await fetch(`${API_BASE}/getProperties`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured properties');
    }
    const data = await response.json();

    // Save to cache
    saveToCache(CACHE_KEY_FEATURED, data);
    return data;
  },

  getAllProperties: async (): Promise<AllPropertiesResponse> => {
    // Check cache first
    const CACHE_KEY_ALL_V3 = 'wasi_all_properties_v3';
    const cached = getFromCache<AllPropertiesResponse>(CACHE_KEY_ALL_V3);
    if (cached) return cached;

    const ID_COMPANY = '14863247';
    // @ts-ignore
    const WASI_TOKEN = process.env.WASI_TOKEN;

    if (!WASI_TOKEN) {
      console.error("WASI_TOKEN not found");
      throw new Error("Missing configuration");
    }

    let allProperties: any[] = [];
    const limit = 20;

    // 1. Fetch first page
    const firstUrl = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&limit=${limit}&skip=0&status=4`;
    const firstRes = await fetch(firstUrl);
    if (!firstRes.ok) throw new Error('Failed to fetch Wasi properties');
    const firstData = await firstRes.json();

    // Parse objects to array
    const firstPageProps = Object.keys(firstData)
      .filter(key => !isNaN(parseInt(key)))
      .map(key => firstData[key]);
    allProperties.push(...firstPageProps);

    const total = firstData.total || 0;

    // 2. Fetch remaining in parallel
    if (total > limit) {
      const promises = [];
      for (let skip = limit; skip < total; skip += limit) {
        const url = `https://api.wasi.co/v1/property/search?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}&limit=${limit}&skip=${skip}&status=4`;
        promises.push(
          fetch(url).then(async res => {
            if (!res.ok) return [];
            const d = await res.json();
            return Object.keys(d).filter(k => !isNaN(parseInt(k))).map(k => d[k]);
          })
        );
      }
      const results = await Promise.all(promises);
      results.forEach(p => allProperties.push(...p));
    }

    // 3. Fetch Types
    const typesUrl = `https://api.wasi.co/v1/property-type/all?id_company=${ID_COMPANY}&wasi_token=${WASI_TOKEN}`;
    const typesRes = await fetch(typesUrl);
    const typesData = typesRes.ok ? await typesRes.json() : {};
    const propertyTypesRaw = Object.keys(typesData).filter(k => !isNaN(parseInt(k))).map(k => typesData[k]);

    // 4. Process and Normalize
    const uniqueProperties = Array.from(new Map(allProperties.map(p => [p.id_property, p])).values());

    const formattedProperties = uniqueProperties.map((prop: any) => {
      const propType = propertyTypesRaw.find((t: any) => String(t.id_property_type) === String(prop.id_property_type));
      return {
        ...prop,
        property_type: { name: propType ? propType.name : 'No especificado' }
      };
    });

    const cities = [...new Set(formattedProperties.map((p: any) => p.city_label).filter(Boolean))] as string[];

    const result = {
      properties: formattedProperties as Property[],
      cities,
      propertyTypes: propertyTypesRaw
    };

    // Save to cache
    saveToCache(CACHE_KEY_ALL_V3, result);
    return result;
  },

  getPropertyById: async (id: string): Promise<Property> => {
    const response = await fetch(`${API_BASE}/getPropertyById?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch property with ID ${id}`);
    }
    return response.json();
  },
};
