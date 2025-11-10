import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Property } from '../types';
import { wasiService } from '../services/wasiService';
import PropertyCard from '../components/PropertyCard';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/Icons';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const ColombiaPropertiesPage: React.FC = () => {
  const query = useQuery();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState(query.get('search') || '');
  const [operationType, setOperationType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await wasiService.getAllProperties();
        setAllProperties(data.properties.filter(p => p.country_label === 'Colombia'));
        setCities(['all', ...data.cities.sort()]);
      } catch (err) {
        setError('No se pudieron cargar las propiedades.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProperties = useMemo(() => {
    return allProperties.filter(prop => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = prop.title.toLowerCase().includes(searchLower) || 
                         prop.city_label.toLowerCase().includes(searchLower) ||
                         prop.zone_label?.toLowerCase().includes(searchLower);
      const operationMatch = operationType === 'all' || String(prop.for_sale) === operationType;
      const cityMatch = selectedCity === 'all' || selectedCity === prop.city_label;
      return titleMatch && operationMatch && cityMatch;
    });
  }, [allProperties, searchTerm, operationType, selectedCity]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return filteredProperties.slice(startIndex, startIndex + propertiesPerPage);
  }, [filteredProperties, currentPage]);

  const pageCount = Math.ceil(filteredProperties.length / propertiesPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, operationType, selectedCity]);

  const Pagination = () => {
    if (pageCount <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-16">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-brand-gray rounded-lg disabled:opacity-50 transition-colors hover:bg-brand-light">&laquo;</button>
        <span className="px-4 py-2 text-gray-700">Página {currentPage} de {pageCount}</span>
        <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="px-4 py-2 bg-white border border-brand-gray rounded-lg disabled:opacity-50 transition-colors hover:bg-brand-light">&raquo;</button>
      </div>
    );
  };
  
  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-6 pt-36 pb-24">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-brand-black">Propiedades en Colombia</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Encuentra tu próximo hogar en uno de los países más vibrantes del mundo.</p>
        </header>

        {/* Filters */}
        <div className="bg-brand-light p-6 rounded-2xl border border-brand-gray grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-end mb-12">
            <div className="lg:col-span-1">
                <label className="font-semibold text-gray-700 block mb-2">Buscar</label>
                <div className="relative">
                    <input type="text" placeholder="Ciudad, zona o palabra clave..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full form-input h-14 pl-12 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent" />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                </div>
            </div>
            <div>
                <label className="font-semibold text-gray-700 block mb-2">Operación</label>
                <select value={operationType} onChange={e => setOperationType(e.target.value)} className="w-full form-select h-14 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent">
                    <option value="all">Todas</option><option value="true">Venta</option><option value="false">Arriendo</option>
                </select>
            </div>
            <div>
                <label className="font-semibold text-gray-700 block mb-2">Ciudad</label>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full form-select h-14 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent">
                    {cities.map(city => <option key={city} value={city}>{city === 'all' ? 'Todas las ciudades' : city}</option>)}
                </select>
            </div>
        </div>
        
        <main>
          <div className="mb-8">
            <p className="text-gray-600 font-semibold">{filteredProperties.length} propiedades encontradas</p>
          </div>
          {loading && <Spinner />}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            paginatedProperties.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {paginatedProperties.map(prop => (
                    <PropertyCard key={prop.id_property} property={prop} />
                  ))}
                </div>
                <Pagination />
              </>
            ) : (
              <div className="text-center py-20 my-8 bg-brand-light rounded-2xl border border-brand-gray">
                <h3 className="text-3xl font-bold text-brand-black">Sin resultados</h3>
                <p className="text-gray-500 mt-4 max-w-md mx-auto">No se encontraron propiedades que coincidan con tus criterios. Prueba a ajustar los filtros.</p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default ColombiaPropertiesPage;