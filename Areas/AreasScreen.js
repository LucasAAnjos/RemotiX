import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { useSector } from './SectorContext';
import { actions } from '../Utils/floatButton';
import { FloatingAction } from 'react-native-floating-action';


export default function Areas() {
  const navigation = useNavigation();
  const { sectors } = useSector();

  const handleAreaClick = (areaName) => {
    navigation.navigate('AreaDetails', { areaName: areaName.toLowerCase() });
  };

  const handleAddSector = () => {
    navigation.navigate('AddSector');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.areaName}>{item.name}</Text>
          <Text style={styles.textGray}>{item.totalAssets} ativos totais</Text>
          <Text style={styles.textGreen}>{item.activeAssets} ativos</Text>
          <Text style={styles.textGray}>{item.registeredItems} itens cadastrados</Text>
        </View>

        <TouchableOpacity onPress={() => ('Excluir Setor')}>
          <Entypo name="dots-three-vertical" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => handleAreaClick(item.name)}>
        <Text style={styles.buttonText}>Acessar Área</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={sectors}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={1}
          contentContainerStyle={{paddingBottom: 20}} />

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabBox} onPress={handleAddSector}>
          <Text style={styles.fabText}>Adicionar Setor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#001F54' },
  addButtonText: { color: 'white', marginLeft: 6, fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 16, flex: 1, marginHorizontal: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  areaName: { fontWeight: '600', fontSize: 16, color: '#001F54' },
  textGray: { fontSize: 12, color: 'gray' },
  textGreen: { fontSize: 12, color: '#00C853', fontWeight: '600' },
  button: { backgroundColor: '#001F54', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

