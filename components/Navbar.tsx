import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogoIcon } from './Icons';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navClass = isScrolled || !isHomePage
    ? 'bg-brand-white/90 backdrop-blur-lg shadow-sm text-brand-black'
    : 'bg-transparent text-white';
    
  const linkStyle = "transition-colors duration-300 hover:text-brand-accent font-medium";
  const activeLinkStyle = '!text-brand-black';
  
  return (
    <>
      <nav className={`fixed top-0 left-0 w-full px-6 md:px-12 z-50 flex justify-between items-center transition-all duration-300 h-24 ${navClass}`}>
        <Link to="/" className="z-50">
          <LogoIcon className="h-12 w-auto" />
        </Link>
        
        <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-10 items-center text-lg">
          <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive && isHomePage ? (isScrolled ? activeLinkStyle : '') : ''}`}>Inicio</NavLink>
          <NavLink to="/properties/colombia" className={({isActive}) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Colombia</NavLink>
          <NavLink to="/properties/usa" className={({isActive}) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Estados Unidos</NavLink>
        </div>

        <div className="hidden lg:flex items-center gap-4">
            <a href="https://wa.me/573132617894?text=¡Hola!%20Quisiera%20comunicarme%20con%20FM%20Inmobiliaria." target="_blank" rel="noopener noreferrer" className="bg-brand-black text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-80 transition-all duration-300 text-base">
                Contáctanos
            </a>
        </div>
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden z-50 text-inherit">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-8 6h8"} />
          </svg>
        </button>
      </nav>
      
      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-brand-black z-40 transition-opacity duration-500 ease-in-out lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div className="flex flex-col items-center justify-center h-full pt-24">
            <nav className="flex flex-col text-center gap-8">
                <Link to="/" className="text-4xl text-white hover:text-brand-accent transition-colors">Inicio</Link>
                <Link to="/properties/colombia" className="text-4xl text-white hover:text-brand-accent transition-colors">Colombia</Link>
                <Link to="/properties/usa" className="text-4xl text-white hover:text-brand-accent transition-colors">Estados Unidos</Link>
                <a href="https://wa.me/573132617894?text=¡Hola!%20Quisiera%20comunicarme%20con%20FM%20Inmobiliaria." target="_blank" rel="noopener noreferrer" className="mt-8 bg-brand-white text-brand-black px-8 py-4 rounded-full font-semibold text-xl">
                    Contáctanos
                </a>
            </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;