import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  BackHandler,
  Entypo
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { fetchEquipamentsFromFirestore } from '../services/firestoreService';
import {
  getPlantId,
  saveEquipmentToStorage,
  getEquipmentFromStorage,
  getUserRole,
} from '../src/storage/localStorage';
import { resolveStatus } from '../Utils/StatusUtils';

export default function AreaAssets() {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaId } = route.params;

  const [equipment, setEquipment] = useState([]);
  const [plantId, setPlantId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const loadUserRole = async () => {
      const role = await getUserRole();
      setUserRole(role || '');
    };
    loadUserRole();
  }, []);

  const fetchData = async (forceOnline = false) => {
    const id = await getPlantId();
    setPlantId(id);
    if (!id || !areaId) return;

    const cachedEquip = await getEquipmentFromStorage(areaId);
    if (cachedEquip && cachedEquip.length > 0) {
      setEquipment(cachedEquip);
      setIsOnline(false);
    }

    try {
      let equipList = await fetchEquipamentsFromFirestore(id, areaId);

      if (equipList && equipList.length > 0) {
        equipList = equipList.map(e => ({
          ...e,
          status: resolveStatus(e),
        }));

        setEquipment(equipList);
        await saveEquipmentToStorage(areaId, equipList);
        setIsOnline(true);
      } else {
        console.warn('Firestore retornou lista vazia. Mantendo dados do cache.');
      }
    } catch (error) {
      console.warn('Erro ao buscar equipamentos online. Mantendo dados do cache.');
    }
  };


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Áreas');
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={onBackPress} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#001F54" />
          </TouchableOpacity>
        ),
      });

      fetchData();

      return () => backHandler.remove();
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
    if (userRole !== 'pcm') {
      Alert.alert('Permissão negada', 'Você não tem permissão para adicionar equipamentos.');
      return;
    }
    navigation.navigate('AddEquipament', { areaId });
  };

  const activeCount = equipment.filter(e => e.status === 'ativo').length;
  const maintenanceCount = equipment.filter(e => e.status === 'em_manutencao').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.summaryText}>
          {equipment.length} Equipamentos Cadastrados
          {'\n'}{activeCount} Ativo{activeCount !== 1 ? 's' : ''} / {maintenanceCount} Em manutenção
        </Text>
      </View>

      <Text style={styles.syncStatus}>
        {isOnline ? '🟢 Dados online' : '🟡 Dados do cache'}
      </Text>

      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = item.status === 'ativo';
          const isInMaintenance = item.status === 'em_manutencao';

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>               
                <View style={[
                  styles.iconBox,
                  { backgroundColor: isInMaintenance ? '#007bff' : isActive ? '#00C853' : '#D50000' }
                ]}>
                  <MaterialCommunityIcons name="cogs" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.equipamentName}>{item.name}</Text>                             
                  <Text style={styles.grayText}>Série: {item.serialNumber || '-'}</Text>
                  <Text style={[
                    styles.statusText,
                    { color: isInMaintenance ? '#007bff' : isActive ? '#00C853' : '#D50000' }
                  ]}>
                    {isInMaintenance ? 'Manutenção' : isActive ? 'Ativo' : 'Inativo'}
                  </Text>                  
                </View>                
              </View>
              <Text style={styles.grayText}>{item.maintenanceCount ?? 0} manutenções realizadas</Text>
              <TouchableOpacity style={styles.button} onPress={() => handleEquipamentClick(item)}>
                <Text style={styles.buttonText}>Acessar Equipamento</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[
          styles.fabRound,
          { backgroundColor: userRole === 'pcm' ? '#00C853' : '#999999' }
        ]}
        onPress={handleAddEquipament}
        activeOpacity={userRole === 'pcm' ? 0.7 : 1}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },
  header: { marginBottom: 8 },
  summaryText: { fontSize: 14, color: '#001F54', fontWeight: 'bold' },
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
  statusText: { fontSize: 12, fontWeight: 'bold' },
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
  fabRound: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
