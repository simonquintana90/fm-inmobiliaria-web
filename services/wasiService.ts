
import { Property, AllPropertiesResponse } from '../types';

const API_BASE = '/api';

export const wasiService = {
  getFeaturedProperties: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE}/getProperties`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured properties');
    }
    return response.json();
  },

  getAllProperties: async (): Promise<AllPropertiesResponse> => {
    const response = await fetch(`${API_BASE}/getAllProperties`);
    if (!response.ok) {
      throw new Error('Failed to fetch all properties');
    }
    return response.json();
  },

  getPropertyById: async (id: string): Promise<Property> => {
    const response = await fetch(`${API_BASE}/getPropertyById?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch property with ID ${id}`);
    }
    return response.json();
  },
};
