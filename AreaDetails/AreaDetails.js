import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';

const motors = [
  { id: 1, name: 'Motor 1', serialNumber: '999999', maintenanceCount: 5, active: true },
  { id: 2, name: 'Redutor 2', serialNumber: '888888', maintenanceCount: 3, active: false },
];

export default function AreaAssets() {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaName } = route.params;

  const activeMotors = motors.filter(m => m.active).length;

  const handleMotorClick = (equipamentName) => {
    navigation.navigate('EquipamentDetail', {
      areaName,
      equipamentName: equipamentName.toLowerCase().replace(' ', '-'),
    });
  };

  const handleAddEquipament = () => {
    navigation.navigate('AddEquipament');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: item.active ? '#00C853' : '#D50000' }]}>
          <MaterialCommunityIcons name="Equipamento" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.equipamentName}>{item.name}</Text>
          <Text style={styles.grayText}>Série: {item.serialNumber}</Text>
          <Text style={[styles.statusText, { color: item.active ? '#00C853' : '#D50000' }]}>
            {item.active ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <Text style={styles.grayText}>{item.maintenanceCount} manutenções realizadas</Text>

      <TouchableOpacity style={styles.button} onPress={() => handleMotorClick(item.name)}>
        <Text style={styles.buttonText}>Acessar Equipamento</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.grayText} size={20}>
            {motors.length} Equipamentos Cadastrados{'\n'}{activeMotors} Ativo
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddEquipament}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Equipamento</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={motors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { padding: 8, backgroundColor: '#E0E0E0', borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#001F54' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00C853', padding: 10, borderRadius: 8 },
  addButtonText: { color: 'white', marginLeft: 6, fontWeight: 'bold' },
  grayText: { fontSize: 12, color: 'gray' },
  statusText: { fontSize: 13, fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 16, flex: 1, marginHorizontal: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  equipamentName: { fontWeight: 'bold', fontSize: 14, color: '#001F54' },
  iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  button: { marginTop: 12, backgroundColor: '#001F54', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
