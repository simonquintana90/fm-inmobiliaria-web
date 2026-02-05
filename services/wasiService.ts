
import { Property, AllPropertiesResponse } from '../types';

const API_BASE = '/api';

const CACHE_KEY_FEATURED = 'wasi_featured_properties';
const CACHE_KEY_ALL = 'wasi_all_properties';
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
    const cached = getFromCache<AllPropertiesResponse>(CACHE_KEY_ALL);
    if (cached) return cached;

    const response = await fetch(`${API_BASE}/getAllProperties`);
    if (!response.ok) {
      throw new Error('Failed to fetch all properties');
    }
    const data = await response.json();

    // Save to cache
    saveToCache(CACHE_KEY_ALL, data);
    return data;
  },

  getPropertyById: async (id: string): Promise<Property> => {
    const response = await fetch(`${API_BASE}/getPropertyById?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch property with ID ${id}`);
    }
    return response.json();
  },
};
