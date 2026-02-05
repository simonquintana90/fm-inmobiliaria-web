import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface DropdownProps {
    label: string;
    icon?: React.ReactNode;
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
    showDivider?: boolean;
    variant?: 'dark' | 'light';
    placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    icon,
    options,
    selected,
    onSelect,
    showDivider = true,
    variant = 'light',
    placeholder = 'Cualquiera'
}) => {
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

    // Styles based on variant
    const isDark = variant === 'dark';
    const containerHoverClass = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
    const labelClass = isDark ? 'text-white/60' : 'text-gray-500';
    const valueClass = isDark ? 'text-white' : 'text-brand-black';
    const iconClass = isDark ? 'text-white/60' : 'text-brand-black/60';
    const dividerClass = isDark ? 'bg-white/20' : 'bg-gray-200';
    const chevronClass = isDark ? 'text-white/40' : 'text-gray-400';

    return (
        <div className="relative flex-1" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-full flex items-center justify-between px-6 py-4 transition-colors focus:outline-none rounded-xl ${containerHoverClass}`}
            >
                <div className="flex items-center text-left">
                    {icon && (
                        <div className={`${iconClass} mr-3`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <div className={`text-xs uppercase tracking-wider font-semibold ${labelClass}`}>{label}</div>
                        <div className={`font-medium text-sm truncate max-w-[140px] ${valueClass}`}>
                            {selected === 'all' || selected === '' ? placeholder : selected}
                        </div>
                    </div>
                </div>
                <ChevronDownIcon className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${chevronClass}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-2xl py-2 z-50 overflow-hidden animate-subtle-fade-in text-brand-black border border-gray-100">
                    <div className="max-h-60 overflow-y-auto">
                        <button
                            className={`w-full text-left px-5 py-2.5 hover:bg-brand-gray/30 transition-colors ${selected === '' || selected === 'all' ? 'text-brand-black font-semibold bg-brand-light' : 'text-gray-600'}`}
                            onClick={() => { onSelect('all'); setIsOpen(false); }}
                        >
                            {placeholder}
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
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 hidden md:block pointer-events-none ${dividerClass}`}></div>
            )}
        </div>
    );
};

export default Dropdown;
