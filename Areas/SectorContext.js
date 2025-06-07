import React, { createContext, useContext, useState } from 'react';

const SectorContext = createContext();

export const SectorProvider = ({ children }) => {
  const [sectors, setSectors] = useState([
    { id: '1', name: 'Produção', totalAssets: 15, activeAssets: 12, registeredItems: 10 },
    { id: '2', name: 'Classificação', totalAssets: 8, activeAssets: 10, registeredItems: 6 },
    { id: '3', name: 'Setor 2', totalAssets: 12, activeAssets: 10, registeredItems: 9 },
    { id: '4', name: 'Setor 3', totalAssets: 8, activeAssets: 4, registeredItems: 4 },
  ]);

  const addSector = (newSector) => {
    setSectors((prev) => [...prev, { ...newSector, id: String(Date.now()) }]);
  };

  return (
    <SectorContext.Provider value={{ sectors, addSector }}>
      {children}
    </SectorContext.Provider>
  );
};

export const useSector = () => useContext(SectorContext);
