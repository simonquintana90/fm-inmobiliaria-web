
import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';

const UsaPropertiesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://assets.newestateonly.com/iframe-loader/load.js";
    script.async = true;
    script.setAttribute('data-neokey', '67d1fe1dd009d868df93eff8');
    script.setAttribute('data-neolang', 'es');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-6 pt-32 pb-16">
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-brand-black">Propiedades en Estados Unidos</h1>
        <p className="text-lg text-gray-600 mt-2">Explora nuestro portafolio internacional a través de nuestro socio NEO.</p>
      </header>
      <div className="relative w-full" style={{ height: '150vh' }}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-white z-10">
            <Spinner />
            <p className="mt-4 text-gray-600">Cargando propiedades...</p>
          </div>
        )}
        <iframe
          id="NEOiframe"
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          title="Propiedades en Estados Unidos"
        ></iframe>
      </div>
    </div>
  );
};

export default UsaPropertiesPage;