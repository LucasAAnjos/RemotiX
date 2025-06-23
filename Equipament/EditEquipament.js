import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getPlantId } from '../src/storage/localStorage';
import { db } from '../services/firebaseConfig';
import { Trash2 } from 'lucide-react-native';

const EditEquipament = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaId, equipamentId, equipamentName } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [driveType, setDriveType] = useState('IO');
  const [inputSignal, setInputSignal] = useState('');
  const [outputSignal, setOutputSignal] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleDelete}
          style={{ marginRight: 16 }}
          accessibilityLabel="Excluir Equipamento"
        >
          <Trash2 size={24} color="#D32F2F" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, equipamentName]);

  useEffect(() => {
    const fetchData = async () => {
      const plantId = await getPlantId();
      if (!plantId) return;

      const docRef = doc(
        db,
        'plants',
        String(plantId),
        'areas',
        String(areaId),
        'equipaments',
        String(equipamentId)
      );

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setDescription(data.description || '');
        setDriveType(data.driveType || 'IO');
        setInputSignal(data.inputSignal || '');
        setOutputSignal(data.outputSignal || '');
        setIpAddress(data.ipAddress || '');
      }
    };
    fetchData();
  }, [areaId, equipamentId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const plantId = await getPlantId();
      if (!plantId) throw new Error('Plant ID não encontrado');

      const docRef = doc(
        db,
        'plants',
        String(plantId),
        'areas',
        String(areaId),
        'equipaments',
        String(equipamentId)
      );

      let updateData = {
        name,
        description,
        driveType,
      };

      if (driveType === 'IO') {
        updateData.inputSignal = inputSignal;
        updateData.outputSignal = outputSignal;
        updateData.ipAddress = '';
      } else if (driveType === 'Profinet') {
        updateData.ipAddress = ipAddress;
        updateData.inputSignal = '';
        updateData.outputSignal = '';
      } else {
        updateData.inputSignal = '';
        updateData.outputSignal = '';
        updateData.ipAddress = '';
      }

      await updateDoc(docRef, updateData);
      Alert.alert('Sucesso', 'Equipamento atualizado!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar o equipamento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este equipamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              const plantId = await getPlantId();
              if (!plantId) throw new Error('Plant ID não encontrado');

              const docRef = doc(
                db,
                'plants',
                String(plantId),
                'areas',
                String(areaId),
                'equipaments',
                String(equipamentId)
              );

              await deleteDoc(docRef);
              Alert.alert('Sucesso', 'Equipamento excluído.');
              navigation.navigate('AreaDetails', { areaId });
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o equipamento.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
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

      {driveType === 'IO' && (
        <>
          <Text style={styles.label}>Entrada</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a entrada"
            value={inputSignal}
            onChangeText={setInputSignal}
            editable={!isSaving}
          />

          <Text style={styles.label}>Saída</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a saída"
            value={outputSignal}
            onChangeText={setOutputSignal}
            editable={!isSaving}
          />
        </>
      )}

      {driveType === 'Profinet' && (
        <>
          <Text style={styles.label}>Endereço IP</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o IP"
            value={ipAddress}
            onChangeText={setIpAddress}
            editable={!isSaving}
            keyboardType="numeric"
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.saveButton, isSaving && { backgroundColor: '#999' }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  label: { fontWeight: '600', marginTop: 16, color: '#001F54' },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  pickerIOS: {
    height: 180,
  },
  pickerAndroid: {
    height: 50,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#00C853',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditEquipament;