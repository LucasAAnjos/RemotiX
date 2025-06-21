import React, { useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Plus, Paperclip } from 'lucide-react-native';
import { useAuth } from '../ValidaçõesTeste/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getPlantId } from '../src/storage/localStorage';
import { db } from '../services/firebaseConfig';

const EquipamentDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaId, equipamentName, equipamentId } = route.params || {};
  const { user } = useAuth();

  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => navigation.navigate('EquipamentFiles', { areaId, equipamentName, equipamentId })}
        >
          <Paperclip size={24} color="#001F54" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, equipamentName]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const onBackPress = () => {
        navigation.navigate('AreaDetails', {
          areaId, 
        
        });
        return true; 
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      async function fetchMaintenance() {
        try {
          const plantId = await getPlantId();
          const ref = collection(
            db,
            'plants',
            String(plantId),
            'areas',
            String(areaId),
            'equipaments',
            String(equipamentId),
            'maintenance'
          );

          const q = query(ref, orderBy('date', 'desc'), limit(3));
          const snapshot = await getDocs(q);

          if (!isActive) return;

          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setMaintenanceHistory(data);
        } catch (err) {
          console.error('Erro ao buscar histórico:', err);
        }
      }

      fetchMaintenance();

      return () => {
        isActive = false;
        backHandler.remove();
      };
    }, [areaId, equipamentId, navigation])
  );

  const handleStartMaintenance = () => {
    try {
      navigation.navigate('MotorControl', { areaId, equipamentName, equipamentId });
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Erro ao iniciar manutenção.');
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('History', { areaId, equipamentId, equipamentName });
  };

  const formatEquipamentName = (name) => {
    return name?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://images.tcdn.com.br/img/img_prod/681801/motor_eletrico_trifasico_weg_ie3_25cv_220_380_440v_4_polos_baixa_rotacao_5715_variacao_531_1_b11fc83bd6da56ab1669cfc0c2778349.jpg',
          }}
          style={styles.image}
        />

        <TouchableOpacity style={styles.startButton} onPress={handleStartMaintenance}>
          <Plus size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.startButtonText}>Iniciar Manutenção</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Histórico de Manutenções</Text>
          <TouchableOpacity onPress={handleViewHistory}>
            <Text style={styles.viewAll}>Ver Completo</Text>
          </TouchableOpacity>
        </View>

        {maintenanceHistory.length > 0 ? (
          maintenanceHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
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
          ))
        ) : (
          <Text style={styles.historyMeta}>Nenhuma manutenção registrada.</Text>
        )}
      </View>
    </ScrollView>
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
  startButton: {
    backgroundColor: '#00C853',
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F54',
  },
  viewAll: {
    color: '#001F54',
    fontWeight: '500',
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
