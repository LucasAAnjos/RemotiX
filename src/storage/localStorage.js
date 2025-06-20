import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PLANT_ID: 'plantId',
  CACHED_AREAS: 'cachedAreas',
  EQUIPMENT: 'equipment'
};

export const savePlantId = async (plantId) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLANT_ID, String(plantId));
  } catch (error) {
    console.error('Erro ao salvar plantId:', error);
  }
};

export const getPlantId = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PLANT_ID);
    return value !== null ? Number(value) : null;
  } catch (error) {
    console.error('Erro ao obter plantId:', error);
    return null;
  }
};

export const saveAreasToStorage = async (areas) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_AREAS, JSON.stringify(areas));
  } catch (error) {
    console.error('Erro ao salvar áreas no cache:', error);
  }
};

export const getAreasFromStorage = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_AREAS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar áreas do cache:', error);
    return [];
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Erro ao limpar o armazenamento:', error);
  }
};

export const saveEquipmentToStorage = async (equipmentList) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipmentList));
  } catch (error) {
    console.error('Erro ao salvar equipamentos:', error);
  }
};

export const getEquipmentFromStorage = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    if (json !== null) return JSON.parse(json);
    return [];
  } catch (error) {
    console.error('Erro ao obter equipamentos:', error);
    return [];
  }
};

export default {
  savePlantId,
  getPlantId,
  saveAreasToStorage,
  getAreasFromStorage,
  saveEquipmentToStorage,
  getEquipmentFromStorage,
  clearStorage,
};
