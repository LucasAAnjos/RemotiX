import { db } from './firebaseConfig';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';

export const addAreaToFirestore = async (plantId, areaData) => {
  try {
    const docRef = await addDoc(collection(db, `plants/${plantId}/areas`), {
      ...areaData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar área:', error);
    throw error;
  }
};

export const fetchAreasFromFirestore = async (plantId) => {
  const snapshot = await getDocs(collection(db, `plants/${plantId}/areas`));
  const areas = [];
  snapshot.forEach((doc) => {
    areas.push({ id: doc.id, ...doc.data() });
  });
  return areas;
};

export const addEquipamentToFirestore = async (plantId, areaId, equipamentData) => {
  try {
    const docRef = await addDoc(
      collection(db, `plants/${plantId}/areas/${areaId}/equipaments`),
      {
        ...equipamentData,
        createdAt: new Date(),
      }
    );
    return docRef.id; 
  } catch (error) {
    console.error('Erro ao adicionar equipamento:', error);
    throw error;
  }
};

export const fetchEquipamentsFromFirestore = async (plantId, areaId) => {
  const snapshot = await getDocs(
    collection(db, `plants/${plantId}/areas/${areaId}/equipaments`)
  );
  const equipaments = [];
  snapshot.forEach((doc) => {
    equipaments.push({ id: doc.id, ...doc.data() });
  });
  return equipaments;
};
