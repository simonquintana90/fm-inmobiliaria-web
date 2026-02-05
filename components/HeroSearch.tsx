import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, LocationIcon, HomeIcon, DollarIcon, ChevronDownIcon } from './Icons';

interface DropdownProps {
    label: string;
    icon: React.ReactNode;
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
    showDivider?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, icon, options, selected, onSelect, showDivider = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative flex-1" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors focus:outline-none"
            >
                <div className="flex items-center text-left">
                    <div className="text-white/60 mr-3">
                        {icon}
                    </div>
                    <div>
                        <div className="text-xs text-brand-gray/60 uppercase tracking-wider font-semibold">{label}</div>
                        <div className="text-white font-medium text-sm truncate max-w-[120px] lg:max-w-[160px]">
                            {selected || 'Cualquiera'}
                        </div>
                    </div>
                </div>
                <ChevronDownIcon className={`text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-2xl py-2 z-50 overflow-hidden animate-subtle-fade-in text-brand-black">
                    <div className="max-h-60 overflow-y-auto">
                        <button
                            className={`w-full text-left px-5 py-2.5 hover:bg-brand-gray/30 transition-colors ${selected === '' ? 'text-brand-black font-semibold bg-brand-light' : 'text-gray-600'}`}
                            onClick={() => { onSelect(''); setIsOpen(false); }}
                        >
                            Cualquiera
                        </button>
                        {options.map((option, idx) => (
                            <button
                                key={idx}
                                className={`w-full text-left px-5 py-2.5 hover:bg-brand-gray/30 transition-colors ${selected === option ? 'text-brand-black font-semibold bg-brand-light' : 'text-gray-600'}`}
                                onClick={() => { onSelect(option); setIsOpen(false); }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            {showDivider && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-white/20 hidden md:block pointer-events-none"></div>
            )}
        </div>
    );
};

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
                />
                <div className="md:border-none">
                    <Dropdown
                        label="Tipo de Propiedad"
                        icon={<HomeIcon className="w-5 h-5" />}
                        options={types}
                        selected={propertyType}
                        onSelect={setPropertyType}
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
