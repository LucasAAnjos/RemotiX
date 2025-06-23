import { savePlantId, saveUserRole, saveUserName } from '../src/storage/localStorage';
import { db } from './firebaseConfig';
import { collection, addDoc, doc, setDoc, getDocs, getDoc } from 'firebase/firestore';

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
  plantId = String(plantId);
  const areasCol = collection(db, 'plants', plantId, 'areas');
  const areasSnapshot = await getDocs(areasCol);
  const areas = await Promise.all(
    areasSnapshot.docs.map(async (areaDoc) => {
      const areaData = areaDoc.data();
      const equipamentsCol = collection(
        db,
        'plants',
        plantId,
        'areas',
        areaDoc.id,
        'equipaments'
      );
      const equipamentsSnapshot = await getDocs(equipamentsCol);

      const equipaments = equipamentsSnapshot.docs.map((eqDoc) => {
        const data = eqDoc.data();
        return {
          id: eqDoc.id,
          ...data,
          status: data.status || (data.active === false ? 'em_manutencao' : 'ativo'),
        };
      });

      return {
        id: areaDoc.id,
        ...areaData,
        equipments: equipaments,
      };
    })
  );

  return areas;
}

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

export const updateEquipamentInFirestore = async (plantId, areaId, equipamentId, updatedData) => {
  try {
    const equipDocRef = doc(db, 'plants', plantId, 'areas', areaId, 'equipaments', equipamentId);
    await setDoc(equipDocRef, { ...updatedData, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error);
    throw error;
  }
};

export const deleteEquipamentFromFirestore = async (plantId, areaId, equipamentId) => {
  try {
    const equipDocRef = doc(db, 'plants', plantId, 'areas', areaId, 'equipaments', equipamentId);
    await deleteDoc(equipDocRef);
  } catch (error) {
    console.error('Erro ao apagar equipamento:', error);
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

export async function fetchAndStoreUserData(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      await savePlantId(userData.plantID);

      await saveUserRole(userData.role || '');
      await saveUserName(userData.name || '');

      return userData.plantID;
    } else {
      console.warn('Documento do usuário não encontrado no Firestore.');
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return null;
  }
}
