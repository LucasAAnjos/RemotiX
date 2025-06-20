import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function MotorControlScreen() {
  const ws = useRef(null);
  const route = useRoute();
  const { equipamentName } = route.params || {};

  const [status, setStatus] = useState(0); 
  const [bits, setBits] = useState({ retroaviso: false, alarme1: false, alarme2: false });

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.3.8:8080'); // IP local ou ngrok

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
        tag: equipamentName, // aqui você envia a tag associada ao equipamento
        command,
      }));
    } else {
      Alert.alert('Erro', 'WebSocket desconectado');
    }
  };

  let motorImage = require('../assets/motor-off.png');
  if (bits.alarme1 || bits.alarme2) {
    motorImage = require('../assets/motor-off.png');
  } else if (status === 1) {
    motorImage = require('../assets/motor-on.png');
  }

  return (
    <View style={styles.container}>
      <Image source={motorImage} style={styles.motorImage} />

      <Text style={styles.statusText}>Retroaviso: {bits.retroaviso ? 'ON' : 'OFF'}</Text>
      <Text style={styles.statusText}>Alarme 1: {bits.alarme1 ? 'ON' : 'OFF'}</Text>
      <Text style={styles.statusText}>Alarme 2: {bits.alarme2 ? 'ON' : 'OFF'}</Text>
      <Text style={styles.statusText}>Status: {
        status === 0 ? 'Desligado' :
        status === 1 ? 'Ligado' :
        status === 2 ? 'Falha' :
        'Bloqueado para manutenção'
      }</Text>

      <View style={styles.buttons}>
        <Button title="Ligar" onPress={() => sendCommand(1)} />
        <Button title="Desligar" onPress={() => sendCommand(2)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  motorImage: { width: 150, height: 150, marginBottom: 20 },
  statusText: { fontSize: 16, marginVertical: 4 },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '60%',
    justifyContent: 'space-around',
  },
});
