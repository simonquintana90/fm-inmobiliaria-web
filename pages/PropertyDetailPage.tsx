import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Property, PropertyImage } from '../types';
import { wasiService } from '../services/wasiService';
import Spinner from '../components/Spinner';
import { BedIcon, BathIcon, AreaIcon, GarageIcon, LocationIcon, CheckIcon } from '../components/Icons';

const AccordionItem: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-brand-gray">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-6 text-left">
                <h3 className="text-2xl font-bold">{title}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 0V20M0 10H20" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                <div className="pb-8 pt-2 text-gray-600 leading-relaxed text-lg">
                    {children}
                </div>
            </div>
        </div>
    )
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setError('ID de propiedad no especificado.');
      setLoading(false);
      return;
    }
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await wasiService.getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError('No se pudo encontrar la propiedad.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="pt-32 h-screen"><Spinner /></div>;
  if (error) return <div className="pt-32 text-center text-red-500 text-2xl font-semibold">{error}</div>;
  if (!property) return null;

  const images: PropertyImage[] = property.galleries?.['0']
    ? (Object.values(property.galleries['0']) as any[])
        .filter(item => typeof item === 'object' && item !== null && item.url)
        .sort((a, b) => a.position - b.position)
    : (property.main_image ? [{ url: property.main_image.url, url_big: property.main_image.url, position: 0 }] : []);

  const allFeatures = [...(property.features?.internal || []), ...(property.features?.external || [])];
  
  const whatsappLink = `https://wa.me/573132617894?text=${encodeURIComponent(`¡Hola! Estoy interesado en la propiedad "${property.title}": ${window.location.href}`)}`;

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-6 pt-36 pb-24">
        {/* Header */}
        <header className="mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-black max-w-4xl">{property.title}</h1>
            <div className="flex items-center gap-2 mt-4 text-gray-500 text-lg">
                <LocationIcon className="w-5 h-5" />
                <span>{property.city_label}, {property.country_label} {property.zone_label && `- ${property.zone_label}`}</span>
            </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-x-16 gap-y-12">
            <main className="lg:col-span-8">
                 {/* Gallery */}
                <div className="mb-12">
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-gray-200">
                    {images.length > 0 ? (
                      <img src={images[activeImageIndex].url_big} alt={property.title} className="w-full h-full object-cover transition-opacity duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">Sin Imágenes Disponibles</div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-4">
                      {images.map((img, index) => (
                        <button key={index} onClick={() => setActiveImageIndex(index)} className={`rounded-lg overflow-hidden aspect-square w-full focus:outline-none focus:ring-2 focus:ring-brand-black ring-offset-2 transition-all duration-200 ${activeImageIndex === index ? 'ring-2 ring-brand-black opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                          <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                    <AccordionItem title="Descripción" defaultOpen={true}>
                         <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: property.observations || 'Descripción no disponible.' }}></div>
                    </AccordionItem>
                    {allFeatures.length > 0 && (
                        <AccordionItem title="Características">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                                {allFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 text-gray-700">
                                    <CheckIcon className="w-5 h-5 text-brand-black"/>
                                    <span>{feature.nombre}</span>
                                </div>
                                ))}
                            </div>
                        </AccordionItem>
                    )}
                </div>
            </main>

            <aside className="lg:col-span-4">
                <div className="sticky top-32 bg-brand-light p-8 rounded-2xl border border-brand-gray">
                  <div className="py-6 border-b border-brand-gray flex flex-wrap gap-x-8 gap-y-4 justify-center">
                    <div className="flex items-center gap-3 text-lg"><BedIcon /> <span>{property.bedrooms || 0}</span></div>
                    <div className="flex items-center gap-3 text-lg"><BathIcon /> <span>{property.bathrooms || 0}</span></div>
                    <div className="flex items-center gap-3 text-lg"><AreaIcon /> <span>{property.built_area || '--'} m²</span></div>
                    <div className="flex items-center gap-3 text-lg"><GarageIcon /> <span>{property.garages || 0}</span></div>
                  </div>

                  <div className="text-center mt-6">
                     <p className="text-gray-600 text-lg">Precio</p>
                     <p className="text-4xl font-bold text-brand-black my-2">{property.sale_price_label || property.rent_price_label || 'Consultar'}</p>
                     <a 
                        href={whatsappLink}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-8 w-full inline-block bg-brand-black text-white px-6 py-4 rounded-full font-bold text-lg hover:bg-opacity-80 transition-all duration-300"
                     >
                        Contactar
                     </a>
                  </div>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;