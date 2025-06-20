import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { fetchEquipamentsFromFirestore } from '../services/firestoreService';
import {
  getPlantId,
  saveEquipmentToStorage,
  getEquipmentFromStorage,
} from '../src/storage/localStorage';

export default function AreaAssets() {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaId, areaName } = route.params;

  const [equipment, setEquipment] = useState([]);
  const [plantId, setPlantId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (forceOnline = false) => {
    const id = await getPlantId();
    setPlantId(id);
    if (!id || !areaId) return;

    try {
      const equipList = await fetchEquipamentsFromFirestore(id, areaId);
      setEquipment(equipList);
      await saveEquipmentToStorage(areaId, equipList); // salva por área
      setIsOnline(true);
    } catch (error) {
      console.warn('Sem conexão. Carregando cache...');
      if (!forceOnline) {
        const cachedEquip = await getEquipmentFromStorage(areaId);
        setEquipment(cachedEquip || []);
        setIsOnline(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [areaId])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  };

  const handleEquipamentClick = (equipament) => {
    navigation.navigate('EquipamentDetail', {
      areaId,
      equipamentId: equipament.id,
      equipamentName: equipament.name,
    });
  };

  const handleAddEquipament = () => {
    navigation.navigate('AddEquipament', { areaId });
  };

  const activeCount = equipment.filter(e => e.active).length;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: item.active ? '#00C853' : '#D50000' }]}>
          <MaterialCommunityIcons name="cogs" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.equipamentName}>{item.name}</Text>
          <Text style={styles.grayText}>Série: {item.serialNumber || '-'}</Text>
          <Text style={[styles.statusText, { color: item.active ? '#00C853' : '#D50000' }]}>
            {item.active ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>
      <Text style={styles.grayText}>{item.maintenanceCount ?? 0} manutenções realizadas</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleEquipamentClick(item)}>
        <Text style={styles.buttonText}>Acessar Equipamento</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.summaryText}>
          {equipment.length} Equipamentos Cadastrados{'\n'}
          {activeCount} Ativo{activeCount !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddEquipament}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Equipamento</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.syncStatus}>
        {isOnline ? '🟢 Dados online' : '🟡 Dados do cache'}
      </Text>

      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: { fontSize: 14, color: '#001F54', fontWeight: 'bold' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: { color: 'white', marginLeft: 6, fontWeight: 'bold' },
  syncStatus: {
    marginBottom: 8,
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  equipamentName: { fontWeight: 'bold', fontSize: 14, color: '#001F54' },
  grayText: { fontSize: 12, color: 'gray' },
  statusText: { fontSize: 13, fontWeight: 'bold' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#001F54',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
