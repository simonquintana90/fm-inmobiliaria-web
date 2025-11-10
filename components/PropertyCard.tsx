import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { LocationIcon } from './Icons';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { id_property, title, sale_price_label, rent_price_label, city_label, main_image, bedrooms, bathrooms } = property;

  const price = property.for_sale === 'true' ? sale_price_label : rent_price_label;
  const location = city_label || 'Ubicación no disponible';
  const image = main_image?.url || `https://picsum.photos/seed/${id_property}/600/400`;

  return (
    <Link to={`/property/${id_property}`} className="block group">
      <div className="space-y-4">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-brand-black">
            {bedrooms || 0} Hab. / {bathrooms || 0} Baños
          </div>
        </div>
        <div className="px-2">
            <div className="flex justify-between items-start gap-2">
                <h3 className="text-xl font-bold text-brand-black leading-tight flex-1" title={title}>
                    {title}
                </h3>
                <span className="bg-brand-accent/50 text-brand-black font-semibold px-4 py-1.5 rounded-full text-sm">
                    {price}
                </span>
            </div>
          <div className="flex items-center gap-1.5 text-gray-500 mt-2">
            <LocationIcon className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;