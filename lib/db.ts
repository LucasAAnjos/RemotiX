import { Area, Equipment, Maintenance } from "@/.expo/types/Docs";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserPlant(userId: string): Promise<string> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
        throw new Error('User not found');
    }
    const plantId = userDoc.data().plantId;
    if (!plantId) {
        throw new Error('User has no associated plant');
    }
    return String(plantId);
}

export async function getUserData(userId: string): Promise<{ name?: string; email?: string; plantId?: string }> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
        throw new Error('User not found');
    }
    return userDoc.data() as { name?: string; email?: string; plantId?: string };
}

export async function getAreas(plantId: string): Promise<Area[]> {
    const areasCol = collection(db, 'plants', plantId, 'areas');
    const areasSnapshot = await getDocs(areasCol);
    const areas = await Promise.all(
        areasSnapshot.docs.map(async (areaDoc) => {
            const equipments = await getEquipments(plantId, areaDoc.id);

            return {
                id: areaDoc.id,
                ...areaDoc.data(),
                equipments: equipments,
            } as Area;
        })
    );
    return areas;
}

export async function getEquipments(plantId: string, areaId: string): Promise<Equipment[]> {
    const equipmentsCol = collection(
        db,
        'plants',
        plantId,
        'areas',
        areaId,
        'equipments'
    );
    const equipmentsSnapshot = await getDocs(equipmentsCol);
    const equipments = equipmentsSnapshot.docs.map((eqDoc) => ({ id: eqDoc.id, ...eqDoc.data() } as Equipment));
    return equipments;
}

export async function getEquipmentById(plantId: string, areaId: string, equipmentId: string): Promise<Equipment> {
    const equipmentDoc = doc(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId);
    const equipmentSnapshot = await getDoc(equipmentDoc);
    if (!equipmentSnapshot.exists()) {
        throw new Error('Equipment not found');
    }
    return { id: equipmentSnapshot.id, ...equipmentSnapshot.data() } as Equipment;
}

export async function findEquipmentById(plantId: string, equipmentId: string): Promise<{ equipment: Equipment; areaId: string } | null> {
    // Get all areas in the plant
    const areasCol = collection(db, 'plants', plantId, 'areas');
    const areasSnapshot = await getDocs(areasCol);
    
    // Search through each area for the equipment
    for (const areaDoc of areasSnapshot.docs) {
        const areaId = areaDoc.id;
        const equipmentsCol = collection(db, 'plants', plantId, 'areas', areaId, 'equipments');
        const equipmentsSnapshot = await getDocs(equipmentsCol);
        
        const equipmentDoc = equipmentsSnapshot.docs.find(doc => doc.id === equipmentId);
        if (equipmentDoc) {
            return {
                equipment: { id: equipmentDoc.id, ...equipmentDoc.data() } as Equipment,
                areaId: areaId
            };
        }
    }
    
    return null; // Equipment not found
}

export async function getMaintenanceCount(plantId: string, areaId: string, equipmentId: string): Promise<number> {
    const maintenanceCol = collection(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId, 'maintenance');
    const maintenanceQuery = query(maintenanceCol, orderBy('date', 'desc'));
    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    return maintenanceSnapshot.size;
}

export async function getMaintenance(plantId: string, areaId: string, equipmentId: string): Promise<Maintenance[]> {
    const maintenanceCol = collection(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId, 'maintenance');
    const maintenanceQuery = query(maintenanceCol, orderBy('date', 'desc'));
    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    const maintenances = maintenanceSnapshot.docs.map((mDoc) => {
        const data = mDoc.data();
        let date: Date;
        
        // Handle null or undefined date
        if (data.date && data.date.seconds) {
            date = new Date(data.date.seconds * 1000);
        } else {
            date = new Date(); // Fallback to current date
        }
        
        return {
            id: mDoc.id,
            ...data,
            date: date,
        } as unknown as Maintenance;
    });
    return maintenances;
}

export async function postArea(userId: string, area: Area): Promise<void> {
    const plantId = await getUserPlant(userId);
    const areaDoc = doc(db, 'plants', plantId, 'areas', area.id);
    await setDoc(areaDoc, area);
}

export async function deleteArea(userId: string, areaId: string): Promise<void> {
    const plantId = await getUserPlant(userId);
    const areaDoc = doc(db, 'plants', plantId, 'areas', areaId);
    await deleteDoc(areaDoc);
}

export async function postEquipment(plantId: string, areaId: string, equipment: Equipment): Promise<void> {
    const equipmentDoc = doc(db, 'plants', plantId, 'areas', areaId, 'equipments', equipment.id);
    await setDoc(equipmentDoc, equipment);
}

export async function deleteEquipment(plantId: string, areaId: string, equipmentId: string): Promise<void> {
    const equipmentDoc = doc(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId);
    await deleteDoc(equipmentDoc);
}

export async function patchEquipment(plantId: string, areaId: string, equipmentId: string, equipment: Partial<Equipment>): Promise<Equipment> {
    const equipmentDoc = doc(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId);
    await updateDoc(equipmentDoc, equipment);
    
    // Fetch the updated equipment to return
    const updatedDoc = await getDoc(equipmentDoc);
    if (!updatedDoc.exists()) {
        throw new Error('Equipment not found');
    }
    
    return { id: updatedDoc.id, ...updatedDoc.data() } as Equipment;
}

// Real-time listeners with cache-first behavior
export function subscribeToAreas(
    plantId: string, 
    callback: (areas: Area[]) => void
) {
    const areasCol = collection(db, 'plants', plantId, 'areas');
    
    return onSnapshot(areasCol, (snapshot) => {
        const areas = snapshot.docs.map((areaDoc) => ({
            id: areaDoc.id,
            ...areaDoc.data(),
            equipments: [], // Initialize empty, will be populated by individual subscriptions
        } as any));
        
        // Set initial areas without equipment data
        callback(areas);
        
        // Subscribe to equipment for each area
        const unsubscribes: (() => void)[] = [];
        let currentAreas = [...areas]; // Keep track of current state
        
        areas.forEach((area) => {
            const equipmentUnsubscribe = subscribeToEquipments(plantId, area.id, (equipments) => {
                // Update the specific area with new equipment data
                currentAreas = currentAreas.map(a => 
                    a.id === area.id ? { ...a, equipments } : a
                );
                callback([...currentAreas]); // Send a new array reference
            });
            unsubscribes.push(equipmentUnsubscribe);
        });
        
        // Return a cleanup function that unsubscribes from all listeners
        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    });
}

export function subscribeToEquipments(
    plantId: string, 
    areaId: string, 
    callback: (equipments: Equipment[]) => void
) {
    const equipmentsCol = collection(
        db,
        'plants',
        plantId,
        'areas',
        areaId,
        'equipments'
    );
    
    return onSnapshot(equipmentsCol, (snapshot) => {
        const equipments = snapshot.docs.map((eqDoc) => ({ 
            id: eqDoc.id, 
            ...eqDoc.data() 
        } as Equipment));
        callback(equipments);
    });
}

export function subscribeToEquipment(
    plantId: string, 
    areaId: string, 
    equipmentId: string, 
    callback: (equipment: Equipment | null) => void
) {
    const equipmentDoc = doc(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId);
    
    return onSnapshot(equipmentDoc, (snapshot) => {
        if (snapshot.exists()) {
            const equipment = { 
                id: snapshot.id, 
                ...snapshot.data() 
            } as Equipment;
            callback(equipment);
        } else {
            callback(null);
        }
    });
}

export function subscribeToMaintenance(
    plantId: string, 
    areaId: string, 
    equipmentId: string, 
    callback: (maintenances: Maintenance[]) => void
) {
    const maintenanceCol = collection(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId, 'maintenance');
    const maintenanceQuery = query(maintenanceCol, orderBy('date', 'desc'));
    
    return onSnapshot(maintenanceQuery, (snapshot) => {
        const maintenances = snapshot.docs.map((mDoc) => {
            const data = mDoc.data();
            let date: Date;
            
            // Handle null or undefined date
            if (data.date && data.date.seconds) {
                date = new Date(data.date.seconds * 1000);
            } else {
                date = new Date(); // Fallback to current date
            }
            
            return {
                id: mDoc.id,
                ...data,
                date: date,
            } as unknown as Maintenance;
        });
        callback(maintenances);
    });
}

export async function postMaintenance(
    plantId: string, 
    areaId: string, 
    equipmentId: string, 
    maintenance: Omit<Maintenance, 'date'>
): Promise<void> {
    const maintenanceCol = collection(db, 'plants', plantId, 'areas', areaId, 'equipments', equipmentId, 'maintenance');
    await addDoc(maintenanceCol, {
        ...maintenance,
        date: serverTimestamp(),
    });
}

