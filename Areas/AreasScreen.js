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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, Entypo, Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { fetchAreasFromFirestore } from '../services/firestoreService';

import { auth } from '../services/firebaseConfig';
import {
  getPlantId,
  saveAreasToStorage,
  getAreasFromStorage,
} from '../src/storage/localStorage';

export default function Areas() {
  const navigation = useNavigation();
  const [plantId, setPlantId] = useState(null);
  const [areas, setAreas] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (forceOnline = false) => {
    const id = await getPlantId();
    setPlantId(id);

    if (!id) return;

    try {
      const loadedAreas = await fetchAreasFromFirestore(id);
      setAreas(loadedAreas);
      await saveAreasToStorage(loadedAreas);
      setIsOnline(true);
    } catch (err) {
      console.warn('Sem conexão. Carregando cache...');
      if (!forceOnline) {
        const cached = await getAreasFromStorage();
        setAreas(cached);
        setIsOnline(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  };

  const handleAreaClick = (area) => {
    navigation.navigate('AreaDetails', { areaId: area.id, areaName: area.name });
  };

  const handleAddSector = () => {
    navigation.navigate('AddSector');
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.areaName}>{item.name}</Text>
          <Text style={styles.textGray}>{item.totalAssets ?? 0} ativos totais</Text>
          <Text style={styles.textGreen}>{item.activeAssets ?? 0} ativos</Text>
          <Text style={styles.textGray}>{item.registeredItems ?? 0} itens cadastrados</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Ação', 'Excluir Setor')}>
          <Entypo name="dots-three-vertical" size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => handleAreaClick(item)}>
        <Text style={styles.buttonText}>Acessar Área</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Áreas</Text>

        <View style={styles.topRightIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('QrScanner')} style={styles.iconButton}>
            <Feather name="camera" size={22} color="#001F54" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Feather name="log-out" size={22} color="#001F54" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddSector}>
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Adicionar setor</Text>
          </TouchableOpacity>

          <Text style={isOnline ? styles.syncStatusOnline : styles.syncStatusOffline}>
            {isOnline ? '🟢 Dados online' : '🟡 Dados do cache'}
          </Text>
        </View>

        <View style={{ marginTop: 10, alignItems: 'flex-start' }}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Feather name="refresh-ccw" size={20} color="#001F54" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  topRightIcons: {
    flexDirection: 'row',
    gap: 8,
  },

  iconButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#001F54',
    borderRadius: 50,
    padding: 8,
    marginLeft: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F54',
  },

  header: {
    marginBottom: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853',
    padding: 10,
    borderRadius: 8,
  },

  addButtonText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: 'bold',
  },

  syncStatusOnline: {
    fontSize: 12,
    color: '#00C853',
    fontWeight: '600',
  },

  syncStatusOffline: {
    fontSize: 12,
    color: '#d4a100',
    fontWeight: '600',
  },

  refreshButton: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#001F54',
    borderRadius: 50,
    padding: 8,
    alignSelf: 'flex-start',
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  areaName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#001F54',
  },

  textGray: {
    fontSize: 12,
    color: 'gray',
  },

  textGreen: {
    fontSize: 12,
    color: '#00C853',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#001F54',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
