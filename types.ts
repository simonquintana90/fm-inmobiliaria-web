
export interface PropertyImage {
  url: string;
  url_big: string;
  position: number;
}

export interface Property {
  id_property: string;
  title: string;
  for_sale: 'true' | 'false';
  sale_price_label: string;
  rent_price_label: string;
  city_label: string;
  country_label: string;
  zone_label?: string;
  main_image?: { url: string };
  bedrooms?: number;
  bathrooms?: number;
  built_area?: number;
  garages?: number;
  observations?: string;
  galleries?: { '0': { [key: string]: PropertyImage } };
  features?: {
    internal?: { nombre: string }[];
    external?: { nombre: string }[];
  };
  property_type: { name: string };
}

export interface PropertyType {
  id_property_type: number;
  name: string;
}

export interface AllPropertiesResponse {
  properties: Property[];
  cities: string[];
  propertyTypes: PropertyType[];
}
