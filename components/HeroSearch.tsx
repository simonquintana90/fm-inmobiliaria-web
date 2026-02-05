import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, LocationIcon, HomeIcon, DollarIcon } from './Icons';
import Dropdown from './Dropdown';

const HeroSearch: React.FC = () => {
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [operation, setOperation] = useState<'sale' | 'rent'>('sale');

    const handleSearch = () => {
        // Construct query params
        const params = new URLSearchParams();
        params.append('for_sale', operation === 'sale' ? 'true' : 'false');
        if (location) params.append('location', location);
        if (propertyType) params.append('type', propertyType);
        if (priceRange) params.append('price', priceRange);

        navigate(`/properties/colombia?${params.toString()}`);
    };

    const locations = ["Medellín", "Bogotá", "Cartagena", "Cali", "Barranquilla", "Miami"];
    const types = ["Apartamento", "Casa", "Penthouse", "Finca", "Lote", "Oficina"];
    const prices = ["$100M - $300M", "$300M - $600M", "$600M - $1,000M", "$1,000M+"]; // Simplified ranges

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Operation Toggle */}
            <div className="flex justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex">
                    <button
                        onClick={() => setOperation('sale')}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${operation === 'sale'
                                ? 'bg-white text-brand-black shadow-lg scale-105'
                                : 'text-white hover:bg-white/10'
                            }`}
                    >
                        Comprar
                    </button>
                    <button
                        onClick={() => setOperation('rent')}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${operation === 'rent'
                                ? 'bg-white text-brand-black shadow-lg scale-105'
                                : 'text-white hover:bg-white/10'
                            }`}
                    >
                        Arrendar
                    </button>
                </div>
            </div>

            {/* Main Bar */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-full ml-4 mr-4 shadow-2xl flex flex-col md:flex-row divide-y md:divide-y-0 divide-white/10">
                <Dropdown
                    label="Ubicación"
                    icon={<LocationIcon className="w-5 h-5" />}
                    options={locations}
                    selected={location}
                    onSelect={setLocation}
                    variant="dark"
                />
                <div className="md:border-none">
                    <Dropdown
                        label="Tipo de Propiedad"
                        icon={<HomeIcon className="w-5 h-5" />}
                        options={types}
                        selected={propertyType}
                        onSelect={setPropertyType}
                        variant="dark"
                    />
                </div>
                <div className="md:border-none">
                    <Dropdown
                        label="Presupuesto"
                        icon={<DollarIcon className="w-5 h-5" />}
                        options={prices}
                        selected={priceRange}
                        onSelect={setPriceRange}
                        showDivider={false}
                        variant="dark"
                    />
                </div>

                <div className="p-3 md:pl-0">
                    <button
                        onClick={handleSearch}
                        className="w-full md:w-auto h-full bg-brand-white text-brand-black hover:bg-brand-gray transition-colors rounded-xl md:rounded-full px-8 py-3 md:py-0 font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                    >
                        <SearchIcon className="w-5 h-5" />
                        <span>Buscar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSearch;
