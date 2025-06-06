import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSector } from './SectorContext';

export default function AddSector() {
  const [name, setName] = useState('');
  const { addSector } = useSector();
  const navigation = useNavigation();

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Informe um nome para o setor.');
      return;
    }

    addSector({
      name,
      totalAssets: 0,
      activeAssets: 0,
      registeredItems: 0,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome do setor"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Button title="Salvar" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16 },
});
