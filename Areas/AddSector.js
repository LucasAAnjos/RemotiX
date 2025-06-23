import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { addAreaToFirestore } from '../services/firestoreService';
import { getPlantId } from '../src/storage/localStorage';
import { useNavigation } from '@react-navigation/native';

export default function AddSector() {
  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const navigation = useNavigation();

  const handleSave = async () => {
  if (!areaName.trim()) {
    Alert.alert('Erro', 'Informe o nome da área');
    return;
  }

  try {
    const plantId = await getPlantId();
    await addAreaToFirestore(plantId, {
      name: areaName,
      description: areaDescription,
    });

    Alert.alert('Sucesso', 'Área adicionada com sucesso!');
  } catch (error) {
    console.warn('Área salva offline, será sincronizada quando online.');
    Alert.alert('Salvo offline', 'A área será sincronizada quando estiver online.');
  } finally {
    navigation.goBack(); 
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome da Área</Text>
      <TextInput
        placeholder="Ex: Setor de Embalagem"
        value={areaName}
        onChangeText={setAreaName}
        style={styles.input}
      />

      <Text style={styles.label}>Descrição (opcional)</Text>
      <TextInput
        placeholder="Descreva brevemente"
        value={areaDescription}
        onChangeText={setAreaDescription}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F0F4F8' },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001F54',
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },

  button: {
    backgroundColor: '#001F54',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
