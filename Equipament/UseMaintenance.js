import { useState, useEffect } from 'react';

export function useMaintenanceData() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulando fetch de dados
    const fetchData = async () => {
      const fakeData = [
        { id: 1, name: 'Motor 1', status: 'active' },
        { id: 2, name: 'Motor 2', status: 'inactive' },
      ];
      setData(fakeData);
    };

    fetchData();
  }, []);

  return { data };
}