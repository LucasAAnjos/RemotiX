import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

const STORAGE_KEYS = {
  PLANT_ID: 'plantId',
  CACHED_AREAS: 'cachedAreas',
  EQUIPMENT: 'equipment',
  USER_ID: 'userId',
  USER_ROLE: 'userRole',
  USER_NAME: 'userName',
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
    console.log(data)
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

export const saveEquipmentToStorage = async (areaId, equipmentList) => {
  try {
    await AsyncStorage.setItem(`equipment:${areaId}`, JSON.stringify(equipmentList));
  } catch (error) {
    console.error(`Erro ao salvar equipamentos da área ${areaId}:`, error);
  }
};

export const getEquipmentFromStorage = async (areaId) => {
  try {
    const json = await AsyncStorage.getItem(`equipment:${areaId}`);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error(`Erro ao obter equipamentos da área ${areaId}:`, error);
    return [];
  }
};

export const saveUserId = async (userId) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  } catch (error) {
    console.error('Erro ao salvar userId:', error);
  }
};

export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    return userId || null;
  } catch (error) {
    console.error('Erro ao obter userId:', error);
    return null;
  }
};

export const saveUserRole = async (role) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  } catch (error) {
    console.error('Erro ao salvar userRole:', error);
  }
};

export const getUserRole = async () => {
  try {
    const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    return role || null;
  } catch (error) {
    console.error('Erro ao obter userRole:', error);
    return null;
  }
};

export const saveUserName = async (name) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  } catch (error) {
    console.error('Erro ao salvar userName:', error);
  }
};

export const getUserName = async () => {
  try {
    const name = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
    return name || null;
  } catch (error) {
    console.error('Erro ao obter userName:', error);
    return null;
  }
};

export const saveDownloadedFile = async (fileName, fileUrl, localUri) => {
  const data = { url: fileUrl, uri: localUri };
  await AsyncStorage.setItem(`downloadedFile:${fileName}`, JSON.stringify(data));
};

export const getDownloadedFile = async (fileName, fileUrl) => {
  const value = await AsyncStorage.getItem(`downloadedFile:${fileName}`);
  if (value) {
    try {
      const data = JSON.parse(value);
      if (data.url === fileUrl) {
        const fileInfo = await FileSystem.getInfoAsync(data.uri);
        if (fileInfo.exists) return data.uri;
      }
    } catch (e) {
      console.error('Erro ao recuperar arquivo local:', e);
    }
  }
  return null;
};

export default {
  savePlantId,
  getPlantId,
  saveAreasToStorage,
  getAreasFromStorage,
  saveEquipmentToStorage,
  getEquipmentFromStorage,
  clearStorage,
  saveUserId,
  getUserId,
  saveUserRole,
  getUserRole,
  saveUserName,
  getUserName,
  saveDownloadedFile,
  getDownloadedFile,
};