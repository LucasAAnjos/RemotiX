import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getPlantId } from '../src/storage/localStorage';
import { addEquipamentToFirestore } from '../services/firestoreService';

export default function AddEquipament() {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaId, areaName } = route.params || {};

  const [plantId, setPlantId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [driveType, setDriveType] = useState('IO');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPlantId = async () => {
      const id = await getPlantId();
      setPlantId(id);
    };
    fetchPlantId();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do equipamento.');
      return;
    }
    if (!plantId) {
      Alert.alert('Erro', 'Planta não encontrada.');
      return;
    }
    if (!areaId) {
      Alert.alert('Erro', 'Área não informada.');
      return;
    }

    setIsSaving(true);

    const newEquipment = {
      name: name.trim(),
      description: description.trim(),
      driveType,
      active: true,
      maintenanceCount: 0,
      serialNumber: '',
    };

    try {
      await addEquipamentToFirestore(plantId, areaId, newEquipment);
      Alert.alert('Sucesso', 'Equipamento adicionado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o equipamento.');
      console.error(error);
    } finally {
    setIsSaving(false);
   }
};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Equipamento</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome"
        value={name}
        onChangeText={setName}
        editable={!isSaving}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Digite a descrição"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        editable={!isSaving}
      />

      <Text style={styles.label}>Tipo de Acionamento</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={driveType}
          onValueChange={setDriveType}
          mode="dropdown"
          style={Platform.OS === 'ios' ? styles.pickerIOS : styles.pickerAndroid}
          enabled={!isSaving}
        >
          <Picker.Item label="IO" value="IO" />
          <Picker.Item label="Profinet" value="Profinet" />
          <Picker.Item label="CANopen" value="CANopen" />
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.button, isSaving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>{isSaving ? 'Salvando...' : 'Salvar Equipamento'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F0F4F8' },
  label: { marginBottom: 6, fontWeight: 'bold', color: '#001F54' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  pickerAndroid: { height: 50, width: '100%' },
  pickerIOS: { height: 150, width: '100%' },
  button: {
    backgroundColor: '#001F54',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
