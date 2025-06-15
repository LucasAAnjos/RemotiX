import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { useMotor } from '../Models/useMotor';

export default function MotorControlScreen() {
  const { retroaviso, alarme1, alarme2, bloqueio, acionar, ligar, desligar } = useMotor();

  // Decide qual imagem mostrar:
  let motorImage = require('../assets/motor-off.png');
  if (alarme1 || alarme2) {
    motorImage = require('../assets/motor-off.png');
  } else if (acionar) {
    motorImage = require('../assets/motor-on.png');
  }

  return (
    <View style={styles.container}>
      <Image source={motorImage} style={styles.motorImage} />

      <Text style={styles.statusText}>Retroaviso: {retroaviso ? 'ON' : 'OFF'}</Text>
      <Text style={styles.statusText}>Alarme 1: {alarme1 ? 'ON' : 'OFF'}</Text>
      <Text style={styles.statusText}>Alarme 2: {alarme2 ? 'ON' : 'OFF'}</Text>
      <Text style={styles.statusText}>Bloqueio: {bloqueio ? 'ATIVADO' : 'DESATIVADO'}</Text>
      <Text style={styles.statusText}>Motor: {acionar ? 'LIGADO' : 'DESLIGADO'}</Text>

      <View style={styles.buttons}>
        <Button title="Ligar Motor" onPress={ligar} />
        <Button title="Desligar Motor" onPress={desligar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  motorImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginVertical: 4,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '60%',
    justifyContent: 'space-around',
  },
});
