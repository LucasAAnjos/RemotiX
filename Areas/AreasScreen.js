import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import {
  getPlantId,
  saveAreasToStorage,
  getAreasFromStorage,
  getUserRole,
} from '../src/storage/localStorage';
import { fetchAreasFromFirestore } from '../services/firestoreService';

export default function Areas() {
  const navigation = useNavigation();
  const [plantId, setPlantId] = useState(null);
  const [areas, setAreas] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ marginRight: 16 }}
          accessibilityLabel="Logout"
        >
          <Feather name="log-out" size={24} color="#001F54" />
        </TouchableOpacity>
      ),
      headerLeft: null,
      title: 'Áreas',
      headerTitleStyle: { color: '#001F54', fontWeight: 'bold', fontSize: 22 },
    });
  }, [navigation, userRole]);

  const fetchData = async (forceOnline = false) => {
    const id = await getPlantId();
    setPlantId(id);
    if (!id) return;

    const role = await getUserRole();
    setUserRole(role);

    try {
      const loadedAreas = await fetchAreasFromFirestore(id);

      if (!loadedAreas || loadedAreas.length === 0) {
        console.warn('Firestore retornou lista vazia, tentando cache local...');
        const cached = await getAreasFromStorage();
        if (cached && cached.length > 0) {
          setAreas(cached);
          setIsOnline(false);
          return;
        }
      }

      const areasWithCounts = loadedAreas.map((area) => {
        const equipamentos = Array.isArray(area.equipments) ? area.equipments : [];
        const ativos = equipamentos.filter((eq) => eq.status === 'ativo').length;
        const manutencao = equipamentos.filter((eq) => eq.status === 'em_manutencao').length;

        return {
          ...area,
          activeAssets: ativos,
          maintenanceAssets: manutencao,
        };
      });

      setAreas(areasWithCounts);
      await saveAreasToStorage(areasWithCounts);
      setIsOnline(true);
    } catch (err) {
      console.warn('Erro ao buscar online. Tentando cache...');
      const cached = await getAreasFromStorage();
      setAreas(cached || []);
      setIsOnline(false);
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
    if (userRole === 'pcm') {
      navigation.navigate('AddSector');
    } else {
      Alert.alert('Permissão Negada', 'Você não tem permissão para adicionar setores.');
    }
  };

  async function handleLogout() {
    await signOut(auth);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.areaName}>{item.name}</Text>
          <Text style={styles.textGreen}>{item.activeAssets ?? 0} ativos</Text>
          <Text style={styles.textBlue}>{item.maintenanceAssets ?? 0} em manutenção</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => handleAreaClick(item)}>
        <Text style={styles.buttonText}>Acessar Área</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.syncContainer}>
        <Text style={isOnline ? styles.syncStatusOnline : styles.syncStatusOffline}>
          {isOnline ? '🟢 Dados online' : '🟡 Dados do cache'}
        </Text>
      </View>

      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      <TouchableOpacity
        style={[
          styles.fabRound,
          userRole !== 'pcm' && styles.fabRoundDisabled,
        ]}
        onPress={handleAddSector}
        activeOpacity={userRole === 'pcm' ? 0.7 : 1}
      >
        <MaterialIcons
          name="add"
          size={28}
          color={userRole === 'pcm' ? '#fff' : '#888'}
        />
      </TouchableOpacity>

      {/* Botão câmera flutuante acima do adicionar */}
      <TouchableOpacity
        style={styles.fabCamera}
        onPress={() => navigation.navigate('QrScanner')}
      >
        <Feather name="camera" size={24} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },

  syncContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 4,
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

  textGreen: {
    fontSize: 12,
    color: '#00C853',
    fontWeight: '600',
  },

  textBlue: {
    fontSize: 12,
    color: '#007bff',
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

  fabRound: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#00C853',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  fabRoundDisabled: {
    backgroundColor: '#888',
  },

  fabCamera: {
    position: 'absolute',
    bottom: 94,
    right: 24,
    backgroundColor: '#001F54',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});
