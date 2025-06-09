import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function AreaAssets() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { areaName } = route.params;

  const [equipaments, setEquipaments] = useState([]);

  useEffect(() => {
    if (isFocused && route.params?.newEquipament) {
      setEquipaments((prev) => [...prev, route.params.newEquipament]);
    }
  }, [isFocused, route.params?.newEquipament]);

  const activeEquipaments = equipaments.filter((m) => m.active).length;

  const handleMotorClick = (equipamentName) => {
    navigation.navigate('EquipamentDetail', {
      areaName,
      equipamentName: equipamentName.toLowerCase().replace(' ', '-'),
    });
  };

  const handleAddEquipament = () => {
    navigation.navigate('AddEquipament', { areaName });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: item.active ? '#00C853' : '#D50000' }]}>
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.areaName}>{item.name}</Text>
          <Text style={styles.textGray}>Série: {item.serialNumber}</Text>
          <Text style={[item.active ? styles.textGreen : styles.textRed]}>
            {item.active ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <Text style={styles.textGray}>{item.maintenanceCount} manutenções realizadas</Text>

      <TouchableOpacity style={styles.button} onPress={() => handleMotorClick(item.name)}>
        <Text style={styles.buttonText}>Acessar Equipamento</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Equipamentos</Text>
        <Text style={styles.summaryText}>
          Cadastrados: <Text style={styles.summaryBold}>{equipaments.length}</Text>
        </Text>
        <Text style={styles.summaryText}>
          Ativos: <Text style={styles.summaryBold}>{activeEquipaments}</Text>
        </Text>
      </View>


      {equipaments.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: 'gray' }}>
          Nenhum equipamento cadastrado ainda.
        </Text>
      ) : (
        <FlatList
          data={equipaments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabBox} onPress={handleAddEquipament}>
          <Ionicons name="add" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.fabText}>Adicionar Equipamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  summaryBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F54',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  summaryBold: {
    fontWeight: 'bold',
    color: '#00C853',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  textRed: {
    fontSize: 12,
    color: '#D50000',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#001F54',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
