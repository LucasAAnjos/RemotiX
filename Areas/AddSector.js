import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { addAreaToFirestore } from '../services/firestoreService'; // ajuste o caminho se precisar
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
      await addAreaToFirestore(plantId, { name: areaName });
      Alert.alert('Sucesso', 'Área adicionada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a área');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome da Área"
        value={areaName}
        onChangeText={setAreaName}
        style={styles.input}
      />
      <TextInput
        placeholder="Descrição da Área"
        value={areaDescription}
        onChangeText={setAreaDescription}
        style={styles.input}
      />
      <Button title="Salvar" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 16, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});
