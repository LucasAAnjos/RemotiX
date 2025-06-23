import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getPlantId } from '../src/storage/localStorage';

export default function MotorControlScreen() {
  const ws = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { equipamentName, equipamentId, areaId } = route.params || {};

  const [status, setStatus] = useState(0);
  const [bits, setBits] = useState({ retroaviso: false, alarme1: false, alarme2: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.3.8:8080');

    ws.current.onopen = () => console.log('WebSocket conectado');

    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'variableUpdate') {
          setStatus(msg.status);
          setBits(msg.bits);
        }
      } catch (err) {
        console.error('Erro parse WebSocket:', err);
      }
    };

    ws.current.onerror = (err) => console.error('WebSocket erro:', err);
    ws.current.onclose = () => console.log('WebSocket fechado');

    return () => ws.current.close();
  }, []);

  const sendCommand = (command) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      if (!equipamentName) {
        Alert.alert('Erro', 'Tag do equipamento não informada');
        return;
      }

      ws.current.send(JSON.stringify({
        type: 'setCommand',
        tag: equipamentName,
        command,
      }));
    } else {
      Alert.alert('Erro', 'WebSocket desconectado');
    }
  };

  let motorImage = require('../assets/motor-off.png');
  if (bits.alarme1 || bits.alarme2) {
    motorImage = require('../assets/motor-fault.png');
  } else if (status === 1) {
    motorImage = require('../assets/motor-on.png');
  }

  const handleFinishMaintenance = async () => {
    setLoading(true);
    try {
      const plantId = await getPlantId();
      const equipamentRef = doc(
        db,
        'plants',
        String(plantId),
        'areas',
        String(areaId),
        'equipaments',
        String(equipamentId)
      );

      await updateDoc(equipamentRef, { active: true });

    } catch (error) {
      console.warn('Falha ao atualizar Firestore, salvando apenas localmente.');
    } finally {
      setLoading(false);
      navigation.navigate('MaintenanceRegisterScreen', { equipamentId, areaId });
    }
  };

  return (
    <View style={styles.container}>
      <Image source={motorImage} style={styles.motorImage} />

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>Retroaviso: <Text style={styles.bold}>{bits.retroaviso ? 'ON' : 'OFF'}</Text></Text>
        <Text style={styles.statusText}>Alarme 1: <Text style={styles.bold}>{bits.alarme1 ? 'ON' : 'OFF'}</Text></Text>
        <Text style={styles.statusText}>Alarme 2: <Text style={styles.bold}>{bits.alarme2 ? 'ON' : 'OFF'}</Text></Text>
        <Text style={styles.statusText}>Status: <Text style={styles.bold}>
          {status === 0 ? 'Desligado' :
            status === 1 ? 'Ligado' :
              status === 2 ? 'Falha' :
                'Bloqueado para manutenção'}
        </Text></Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.button, styles.btnGreen]} onPress={() => sendCommand(1)}>
          <Text style={styles.buttonText}>Ligar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.btnRed]} onPress={() => sendCommand(2)}>
          <Text style={styles.buttonText}>Desligar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.fullWidthButton, styles.btnBlue]}
        onPress={handleFinishMaintenance}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Finalizar Manutenção</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#F0F4F8' },

  motorImage: { width: 160, height: 160, marginBottom: 24 },

  statusBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    elevation: 2,
  },

  fullWidthButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20, 
  },

  statusText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },

  bold: {
    fontWeight: 'bold',
    color: '#001F54',
  },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  btnGreen: { backgroundColor: '#00C853' },
  btnRed: { backgroundColor: '#D50000' },
  btnBlue: { backgroundColor: '#007bff' },
});
