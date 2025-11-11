import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-black text-white">
      <div className="container mx-auto px-6 pt-24 pb-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 flex flex-col items-start">
            <LogoIcon className="h-16 w-auto mb-6" />
            <p className="text-gray-400 max-w-sm text-lg">
              El Arte de Habitar. Espacios únicos que inspiran una vida mejor.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 tracking-wider">Menú</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-brand-accent transition-colors">Inicio</Link></li>
                <li><Link to="/properties/colombia" className="text-gray-400 hover:text-brand-accent transition-colors">Colombia</Link></li>
                <li><Link to="/properties/panama" className="text-gray-400 hover:text-brand-accent transition-colors">Panamá</Link></li>
                <li><Link to="/properties/dominican-republic" className="text-gray-400 hover:text-brand-accent transition-colors">Rep. Dominicana</Link></li>
                <li><Link to="/properties/usa" className="text-gray-400 hover:text-brand-accent transition-colors">USA</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 tracking-wider">Social</h4>
              <ul className="space-y-3">
                <li><a href="https://www.instagram.com/fm_inmobiliaria/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-accent transition-colors">Instagram</a></li>
                <li><a href="https://www.youtube.com/channel/UCEUtg5vtxIvggYBiJ_vLt3Q" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-accent transition-colors">YouTube</a></li>
                <li><a href="https://www.facebook.com/profile.php?id=100084233577175" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-accent transition-colors">Facebook</a></li>
                <li><a href="https://www.linkedin.com/in/fabian-andres-moreno-oliveros-71871121/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-accent transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

        </div>
        <div className="mt-24 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} FM Inversiones Inmobiliarias. Todos los derechos reservados.</p>
          <p className="mt-4">
            Crafted by{' '}
            <a href="https://www.cosmicaweb.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-300">
              cósmica
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;