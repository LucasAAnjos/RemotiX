import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Plus, Paperclip } from 'lucide-react-native';
import { useAuth } from '../ValidaçõesTeste/AuthContext';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getPlantId } from '../src/storage/localStorage';
import { db } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const EquipamentDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaId, equipamentName, equipamentId } = route.params || {};
  const { user } = useAuth();

  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [status, setStatus] = useState('ativo');
  const [showTechnicalData, setShowTechnicalData] = useState(false);
  const [technicalData, setTechnicalData] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: equipamentName || 'Equipamento',
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 16 }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EquipamentFiles', {
                areaId,
                equipamentName,
                equipamentId,
              })
            }
            style={{ marginRight: 20 }}
          >
            <Paperclip size={24} color="#001F54" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('EditEquipament', { areaId, equipamentId })}
          >
            <Ionicons name="pencil" size={24} color="#001F54" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, equipamentName, areaId, equipamentId]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const onBackPress = () => {
        navigation.navigate('AreaDetails', { areaId });
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      const fetchData = async () => {
        try {
          const plantId = await getPlantId();

          const equipamentRef = doc(
            db,
            'plants',
            String(plantId),
            'areas',
            String(areaId),
            'equipaments',
            String(equipamentId)
          );
          const equipamentSnap = await getDoc(equipamentRef);
          if (equipamentSnap.exists()) {
            const data = equipamentSnap.data();
            setStatus(data.active === false ? 'em_manutencao' : 'ativo');

            setTechnicalData({
              description: data.description || 'Sem descrição',
              driveType: data.driveType || 'Não definido',
              ip: data.ip || null,
              ioInput: data.inputSignal || null,
              ioOutput: data.outputSignal || null,
            });
          }

          const ref = collection(equipamentRef, 'maintenance');
          const q = query(ref, orderBy('date', 'desc'), limit(10));
          const snapshot = await getDocs(q);

          if (!isActive) return;

          const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMaintenanceHistory(history);
        } catch (err) {
          console.error('Erro ao buscar dados:', err);
        }
      };

      fetchData();

      return () => {
        isActive = false;
        backHandler.remove();
      };
    }, [areaId, equipamentId, navigation])
  );

  const handleStartMaintenance = async () => {
    let sucesso = false;
    try {
      const plantId = await getPlantId();

      const equipamentRef = doc(
        db,
        'plants',
        String(plantId),
        'areas',
        String(areaId),
        'equipaments',
        String(equipamentId)
      );

      await updateDoc(equipamentRef, { active: false });
      sucesso = true;
    } catch (error) {
      console.warn('Firestore indisponível, assumindo modo offline.');
    } finally {
      setStatus('em_manutencao');

      if (!sucesso) {
        Alert.alert('Modo Offline', 'Iniciando manutenção localmente. A sincronização ocorrerá depois.');
      }

      navigation.navigate('MotorControl', { areaId, equipamentName, equipamentId });
    }
  };


  const isInMaintenance = status === 'em_manutencao';

  const renderMaintenanceItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDescription}>{item.description}</Text>
      <Text style={styles.historyMeta}>
        {item.date?.seconds
          ? new Date(item.date.seconds * 1000).toLocaleString('pt-BR')
          : 'Data inválida'}
      </Text>
      <Text style={styles.historyMeta}>
        {item.user} - {item.role}
      </Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      <View style={styles.card}>
        <View style={{ position: 'relative' }}>
          {showTechnicalData && technicalData ? (
            <View style={styles.technicalDataContainer}>
              <Text style={styles.techLabel}>Descrição:</Text>
              <Text style={styles.techValue}>{technicalData.description}</Text>

              <Text style={styles.techLabel}>Tipo de Acionamento:</Text>
              <Text style={styles.techValue}>{technicalData.driveType}</Text>

              {technicalData.driveType === 'IO' && (
                <>
                  <Text style={styles.techLabel}>Entrada IO:</Text>
                  <Text style={styles.techValue}>{technicalData.ioInput || 'Não definido'}</Text>

                  <Text style={styles.techLabel}>Saída IO:</Text>
                  <Text style={styles.techValue}>{technicalData.ioOutput || 'Não definido'}</Text>
                </>
              )}

              {technicalData.driveType === 'Profinet' && (
                <>
                  <Text style={styles.techLabel}>IP:</Text>
                  <Text style={styles.techValue}>{technicalData.ip || 'Não definido'}</Text>
                </>
              )}
            </View>
          ) : (
            <Image
              source={{
                uri:
                  'https://images.tcdn.com.br/img/img_prod/681801/motor_eletrico_trifasico_weg_ie3_25cv_220_380_440v_4_polos_baixa_rotacao_5715_variacao_531_1_b11fc83bd6da56ab1669cfc0c2778349.jpg',
              }}
              style={styles.image}
            />
          )}

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowTechnicalData(!showTechnicalData)}
          >
            <Text style={styles.infoButtonText}>i</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: isInMaintenance ? '#007bff' : '#00C853' }]}
          onPress={handleStartMaintenance}
        >
          <Plus size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.startButtonText}>
            {isInMaintenance ? 'Continuar Manutenção' : 'Iniciar Manutenção'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { paddingBottom: 0 }]}>
        <Text style={styles.historyTitle}>Histórico de Manutenções</Text>
      </View>
    </>
  );

  return (
    <FlatList
      data={maintenanceHistory}
      keyExtractor={item => item.id}
      renderItem={renderMaintenanceItem}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      ListEmptyComponent={<Text style={styles.historyMeta}>Nenhuma manutenção registrada.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F9FAFB' },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#001F54',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  technicalDataContainer: {
    padding: 12,
    backgroundColor: '#E3EAF7',
    borderRadius: 8,
  },
  techLabel: {
    fontWeight: '700',
    color: '#001F54',
    marginTop: 6,
  },
  techValue: {
    fontWeight: '400',
    color: '#001F54',
  },
  startButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F54',
    marginBottom: 12,
    paddingLeft: 4,
  },
  historyItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingLeft: 12,
    marginBottom: 12,
  },
  historyDescription: {
    fontWeight: '600',
    color: '#001F54',
  },
  historyMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default EquipamentDetail;
