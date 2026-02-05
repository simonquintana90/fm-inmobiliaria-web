import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Property } from '../types';
import { wasiService } from '../services/wasiService';
import PropertyCard from '../components/PropertyCard';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/Icons';

// Helper function to normalize strings for comparison (lowercase, no accents)
const normalizeString = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const ColombiaPropertiesPage: React.FC = () => {
  const location = useLocation();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize state from URL params
  const queryParams = new URLSearchParams(location.search);

  const [searchTerm, setSearchTerm] = useState('');
  const [operationType, setOperationType] = useState<string>(
    queryParams.get('for_sale') === 'true' ? 'true' : queryParams.get('for_sale') === 'false' ? 'false' : 'all'
  );
  const [selectedCity, setSelectedCity] = useState<string>(queryParams.get('location') || 'all');
  const [selectedType, setSelectedType] = useState<string>(queryParams.get('type') || 'all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(queryParams.get('price') || 'all');

  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9;

  const pageHeaderRef = useRef<HTMLElement>(null);

  // Price filtering helper
  const parsePrice = (priceLabel: string): number => {
    // Remove currency symbols, dots, etc.
    return parseInt(priceLabel.replace(/[^0-9]/g, '')) || 0;
  };

  const isPriceInRange = (priceLabel: string, range: string): boolean => {
    if (range === 'all') return true;
    const price = parsePrice(priceLabel);
    // Example ranges: "$100M - $300M", "$1,000M+"
    // Simplified Logic based on the string values we set in HeroSearch
    // Assuming millions (COP) for this logic

    const MILLION = 1000000;

    if (range.includes('+')) {
      const min = parseInt(range.replace(/[^0-9]/g, '')) * MILLION;
      return price >= min;
    }

    const parts = range.split('-');
    if (parts.length === 2) {
      const min = parseInt(parts[0].replace(/[^0-9]/g, '')) * MILLION;
      const max = parseInt(parts[1].replace(/[^0-9]/g, '')) * MILLION;
      return price >= min && price <= max;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await wasiService.getAllProperties();

        const colombiaProperties = data.properties.filter(
          p => normalizeString(p.country_label) === 'colombia'
        );

        setAllProperties(colombiaProperties);

        const colombiaCities = [...new Set(colombiaProperties.map(p => p.city_label).filter(Boolean))];
        setCities(['all', ...colombiaCities.sort()]);

        const types = [...new Set(colombiaProperties.map(p => p.property_type?.name).filter(Boolean))];
        setPropertyTypes(['all', ...types.sort()]);

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

      const cityMatch = selectedCity === 'all' || normalizeString(prop.city_label) === normalizeString(selectedCity);

      const typeMatch = selectedType === 'all' || (prop.property_type?.name && normalizeString(prop.property_type.name).includes(normalizeString(selectedType)));

      // Get correct price label based on operation
      const priceLabel = prop.for_sale === 'true' ? prop.sale_price_label : prop.rent_price_label;
      const priceMatch = isPriceInRange(priceLabel, selectedPriceRange);

      return titleMatch && operationMatch && cityMatch && typeMatch && priceMatch;
    });
  }, [allProperties, searchTerm, operationType, selectedCity, selectedType, selectedPriceRange]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return filteredProperties.slice(startIndex, startIndex + propertiesPerPage);
  }, [filteredProperties, currentPage]);

  const pageCount = Math.ceil(filteredProperties.length / propertiesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, operationType, selectedCity, selectedType, selectedPriceRange]);

  useEffect(() => {
    if (!loading) {
      pageHeaderRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage, loading]);

  const Pagination = () => {
    if (pageCount <= 1) return null;

    const getPaginationItems = () => {
      const delta = 1;
      const left = currentPage - delta;
      const right = currentPage + delta + 1;
      const range: (number | string)[] = [];
      const rangeWithDots: (number | string)[] = [];
      let l: number | undefined;

      for (let i = 1; i <= pageCount; i++) {
        if (i === 1 || i === pageCount || (i >= left && i < right)) {
          range.push(i);
        }
      }

      for (const i of range) {
        if (l) {
          if ((i as number) - l === 2) {
            rangeWithDots.push(l + 1);
          } else if ((i as number) - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i as number;
      }
      return rangeWithDots;
    };

    const paginationItems = getPaginationItems();

    return (
      <div className="flex justify-center items-center gap-2 mt-16">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-brand-gray rounded-lg disabled:opacity-50 transition-colors hover:bg-brand-light">&laquo;</button>
        {paginationItems.map((item, index) =>
          typeof item === 'number' ? (
            <button
              key={index}
              onClick={() => setCurrentPage(item)}
              className={`px-4 py-2 border border-brand-gray rounded-lg transition-colors text-center w-12 ${currentPage === item
                ? 'bg-brand-black text-white border-brand-black'
                : 'bg-white hover:bg-brand-light'
                }`}
            >
              {item}
            </button>
          ) : (
            <span key={index} className="px-4 py-2 text-gray-500">
              {item}
            </span>
          )
        )}
        <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="px-4 py-2 bg-white border border-brand-gray rounded-lg disabled:opacity-50 transition-colors hover:bg-brand-light">&raquo;</button>
      </div>
    );
  };

  const priceRanges = ["$100M - $300M", "$300M - $600M", "$600M - $1,000M", "$1,000M+"];

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-6 pt-36 pb-24">
        <header ref={pageHeaderRef} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-brand-black">Propiedades en Colombia</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Encuentra tu próximo hogar en uno de los países más vibrantes del mundo.</p>
        </header>

        {/* Filters */}
        <div className="bg-brand-light p-6 rounded-2xl border border-brand-gray mb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="lg:col-span-1">
              <label className="font-semibold text-gray-700 block mb-2">Buscar</label>
              <div className="relative">
                <input type="text" placeholder="Palabra clave..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full form-input h-12 pl-10 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent" />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Operación</label>
              <select value={operationType} onChange={e => setOperationType(e.target.value)} className="w-full form-select h-12 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent">
                <option value="all">Cualquiera</option><option value="true">Venta</option><option value="false">Arriendo</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Ciudad</label>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full form-select h-12 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent">
                {cities.map(city => <option key={city} value={city}>{city === 'all' ? 'Todas las ciudades' : city}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Tipo de Inmueble</label>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full form-select h-12 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent">
                {propertyTypes.map(type => <option key={type} value={type}>{type === 'all' ? 'Todos los tipos' : type}</option>)}
              </select>
            </div>
          </div>
          {/* Advanced Second Row */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end mt-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Presupuesto</label>
              <select value={selectedPriceRange} onChange={e => setSelectedPriceRange(e.target.value)} className="w-full form-select h-12 rounded-lg border-gray-300 focus:ring-brand-accent focus:border-brand-accent">
                <option value="all">Cualquier precio</option>
                {priceRanges.map(range => <option key={range} value={range}>{range}</option>)}
              </select>
            </div>
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