import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { wasiService } from '../services/wasiService';
import PropertyCard from '../components/PropertyCard';
import Spinner from '../components/Spinner';
import { ArrowRightIcon, KeyIcon, ChartBarIcon, BriefcaseIcon } from '../components/Icons';
import HeroSearch from '../components/HeroSearch';

const useAnimateOnScroll = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('animate-subtle-fade-in');
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);
};

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/358636/pexels-photo-358636.jpeg"
          alt="Modern home exterior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-t from-brand-white to-transparent"></div>
      </div>
      <div className="relative z-10 container mx-auto px-6 opacity-0 animate-subtle-fade-in" style={{ animationDelay: '0.3s' }}>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight drop-shadow-lg">
          Descubre tu hogar ideal hoy
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-100 drop-shadow-md">
          Un mundo de propiedades únicas e inolvidables te espera.
        </p>

        {/* Advanced Search Bar Component */}
        <HeroSearch />
      </div>
    </section>
  );
};

const Discover: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useAnimateOnScroll(sectionRef);
  return (
    <section ref={sectionRef} className="py-28 bg-brand-white opacity-0">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <p className="font-semibold text-gray-500 tracking-widest mb-2">DESCUBRE</p>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-black leading-tight">
              Encuentra tu próximo espacio ideal.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-lg text-gray-600 leading-relaxed">
              Ya sea que estés planeando una escapada, buscando una inversión, o un nuevo lugar para trabajar, tenemos el espacio perfecto esperándote.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

const services = [
  { icon: <BriefcaseIcon className="w-8 h-8 text-brand-black" />, title: "Curaduría Exclusiva", description: "Propiedades con carácter y potencial que cumplen con los más altos estándares." },
  { icon: <ChartBarIcon className="w-8 h-8 text-brand-black" />, title: "Asesoría de Inversión", description: "Acompañamiento experto para asegurar que tu inversión sea inteligente e inspiradora." },
  { icon: <KeyIcon className="w-8 h-8 text-brand-black" />, title: "Gestión Integral", description: "Manejamos todos los detalles para una experiencia sin preocupaciones." },
]

const WhyChooseUs: React.FC = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  useAnimateOnScroll(sectionRef);

  return (
    <section ref={sectionRef} className="py-28 bg-brand-light opacity-0">
      <div className="container mx-auto px-6 text-center">
        <p className="font-semibold text-gray-500 tracking-widest mb-2">POR QUÉ ELEGIRNOS</p>
        <h2 className="text-4xl md:text-5xl font-bold text-brand-black leading-tight max-w-3xl mx-auto">
          Tu compañero de confianza para encontrar propiedades memorables
        </h2>
        <div className="grid md:grid-cols-3 gap-12 mt-20 text-left">
          {services.map((service, index) => (
            <div key={index}>
              <div className="bg-brand-accent/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FeaturedProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  useAnimateOnScroll(sectionRef);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await wasiService.getFeaturedProperties();
        setProperties(data);
      } catch (err) {
        setError('No se pudieron cargar las propiedades destacadas.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 bg-brand-white opacity-0">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-xl">
            <p className="font-semibold text-gray-500 tracking-widest mb-2">DESCUBRE</p>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-black leading-tight">Explora tu próximo destino</h2>
          </div>
          <Link to="/properties/colombia" className="hidden md:inline-block bg-brand-black text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-80 transition-colors">
            Ver más
          </Link>
        </div>
        {loading && <Spinner />}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {properties.map(prop => (
                <PropertyCard key={prop.id_property} property={prop} />
              ))}
            </div>
            <div className="text-center mt-16 md:hidden">
              <Link to="/properties/colombia" className="inline-block bg-brand-black text-white px-8 py-4 rounded-full font-semibold">
                Ver Todas
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const CtaSection: React.FC = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  useAnimateOnScroll(sectionRef);
  return (
    <section ref={sectionRef} className="py-28 bg-brand-light opacity-0">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-brand-black leading-tight max-w-3xl mx-auto">
          Encuentra un hogar lejos de casa
        </h2>
        <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
          Permítenos ayudarte a encontrar la propiedad perfecta que se ajuste a tu estilo de vida.
        </p>
        <a href="https://wa.me/573132617894?text=¡Hola!%20Quisiera%20comunicarme%20con%20FM%20Inmobiliaria." target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-80 transition-all duration-300 mt-10">
          Contáctanos
        </a>
      </div>
    </section>
  )
}

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Discover />
      <FeaturedProperties />
      <WhyChooseUs />
      <CtaSection />
    </>
  );
};

export default HomePage;