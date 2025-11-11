
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ColombiaPropertiesPage from './pages/ColombiaPropertiesPage';
import UsaPropertiesPage from './pages/UsaPropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PanamaPropertiesPage from './pages/PanamaPropertiesPage';
import DominicanRepublicPropertiesPage from './pages/DominicanRepublicPropertiesPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties/colombia" element={<ColombiaPropertiesPage />} />
            <Route path="/properties/panama" element={<PanamaPropertiesPage />} />
            <Route path="/properties/dominican-republic" element={<DominicanRepublicPropertiesPage />} />
            <Route path="/properties/usa" element={<UsaPropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
