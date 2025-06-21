import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getPlantId } from '../src/storage/localStorage';
import { useRoute, useNavigation } from '@react-navigation/native';

const MaintenanceRegisterScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { areaId, equipamentId } = route.params || {};

  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [maintenanceId, setMaintenanceId] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [entryDate, setEntryDate] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const name = await AsyncStorage.getItem('userName');
      const userRole = await AsyncStorage.getItem('userRole');
      setUserName(name || 'Desconhecido');
      setRole(userRole || 'Desconhecido');
      setEntryDate(new Date());
    };

    const loadNextId = async () => {
      const plantId = await getPlantId();
      const collectionRef = collection(
        db,
        'plants',
        String(plantId),
        'areas',
        String(areaId),
        'equipaments',
        String(equipamentId),
        'maintenance'
      );

      const snapshot = await getDocs(collectionRef);
      setMaintenanceId(snapshot.size + 1);
    };

    loadUserData();
    loadNextId();
  }, []);

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Descreva a manutenção.');
      return;
    }

    try {
        setIsSaving(true);
        const plantId = await getPlantId();

        await addDoc(
            collection(
                db,
                'plants',
                String(plantId),
                'areas',
                String(areaId),
                'equipaments',
                String(equipamentId),
                'maintenance'
            ),
            {
            id: maintenanceId,
            description,
            user: userName,
            role,
            date: entryDate,
            }
        );

        Alert.alert('Sucesso', 'Manutenção registrada!');
        navigation.navigate('EquipamentDetail', {
            areaId,
            equipamentId,
        });
    } catch (err) {
      console.error('Erro ao salvar manutenção:', err);
      Alert.alert('Erro', 'Falha ao registrar manutenção.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Registro de Manutenção</Text>

          <Text style={styles.label}>Usuário: <Text style={styles.value}>{userName}</Text></Text>
          <Text style={styles.label}>Função: <Text style={styles.value}>{role}</Text></Text>
          <Text style={styles.label}>Data: <Text style={styles.value}>{entryDate?.toLocaleString()}</Text></Text>

          <TextInput
            style={styles.input}
            placeholder="Descrição da manutenção"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {isSaving ? (
            <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
          ) : (
            <Button title="Salvar manutenção" onPress={handleSave} color="#28a745" />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#001F54',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    fontWeight: 'normal',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    height: 100,
    marginTop: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
});

export default MaintenanceRegisterScreen;
