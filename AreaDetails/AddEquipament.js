import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddEquipament() {
  const navigation = useNavigation();
  const route = useRoute();
  const { areaName } = route.params;

  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({ name: '', serial: '' });

  const validate = () => {
    let valid = true;
    let nameError = '';
    let serialError = '';

    if (!name.trim()) {
      nameError = 'Nome do equipamento é obrigatório';
      valid = false;
    }

    if (serialNumber.length !== 8 || !/^\d+$/.test(serialNumber)) {
      serialError = 'Número de série deve conter 8 dígitos';
      valid = false;
    }

    setErrors({ name: nameError, serial: serialError });
    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;

    const newEquipament = {
      id: Date.now(),
      name,
      serialNumber,
      active,
      maintenanceCount: 0,
    };

    navigation.navigate('AreaDetails', {
      areaName,
      newEquipament,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Equipamento</Text>

      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nome do Equipamento"
        value={name}
        onChangeText={setName}
      />
      {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

      <TextInput
        style={[styles.input, errors.serial && styles.inputError]}
        placeholder="Número de Série"
        value={serialNumber}
        onChangeText={setSerialNumber}
        keyboardType="numeric"
        maxLength={8}
      />
      {errors.serial ? <Text style={styles.errorText}>{errors.serial}</Text> : null}

      <View style={styles.switchBox}>
        <Text style={styles.label}>Está Ativo?</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar Equipamento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#001F54' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  inputError: {
    borderColor: '#D50000',
  },
  errorText: {
    color: '#D50000',
    fontSize: 12,
    marginBottom: 12,
  },
  switchBox: {
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 24,
  },
  label: { fontSize: 16, color: '#001F54', fontWeight: '500' },
  button: {
    backgroundColor: '#00C853',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
