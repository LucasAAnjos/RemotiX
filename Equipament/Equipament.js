import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../ValidaçõesTeste/AuthContext';
import { useMaintenanceData } from './UseMaintenance';

const EquipamentDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaName, EquipamentName } = route.params || {};
  const { user } = useAuth();
  const { addMaintenanceRecord } = useMaintenanceData();

  const maintenanceHistory = [
    {
      id: 1,
      date: '15/11/2024',
      description: 'Troca de rolamentos',
      responsible: 'João Silva',
      function: 'Técnico Mecânico'
    },
    {
      id: 2,
      date: '10/11/2024',
      description: 'Lubrificação geral',
      responsible: 'Maria Santos',
      function: 'Técnica Industrial'
    },
    {
      id: 3,
      date: '05/11/2024',
      description: 'Verificação elétrica',
      responsible: 'Pedro Costa',
      function: 'Eletricista'
    }
  ];

  const handleStartMaintenance = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const newMaintenanceItem = {
        ticketNumber: `#MT-${String(Date.now()).slice(-3)}`,
        description: '',
        responsible: user.username,
        function: user.role,
        date: dateStr,
        time: timeStr,
      };

      addMaintenanceRecord(newMaintenanceItem);
      navigation.navigate('Maintenance', { areaName, EquipamentName });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao iniciar manutenção.');
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('History', { areaName, EquipamentName });
  };

  const formatEquipamentName = (name) => {
    return name?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: 'https://images.tcdn.com.br/img/img_prod/681801/motor_eletrico_trifasico_weg_ie3_25cv_220_380_440v_4_polos_baixa_rotacao_5715_variacao_531_1_b11fc83bd6da56ab1669cfc0c2778349.jpg'}}
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

        {maintenanceHistory.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.historyDescription}>{item.description}</Text>
            <Text style={styles.historyMeta}>{item.date}</Text>
            <Text style={styles.historyMeta}>{item.responsible} - {item.function}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    marginBottom: 12,
    padding: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F54',
    marginBottom: 16,
  },
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
