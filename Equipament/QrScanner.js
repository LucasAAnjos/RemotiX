import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions  } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

export default function QrScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

   if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Libere as permissões da Câmera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    Alert.alert('Conteúdo escaneado:', data);
    try {
      const parsed = JSON.parse(data);
      if (parsed.areaId && parsed.equipamentId && parsed.equipamentName) {
        navigation.replace('EquipamentDetail', parsed);
      } else {
        Alert.alert('QR Code inválido', 'Os dados do QR Code não são reconhecidos.');
      }
    } catch (err) {
      Alert.alert('Erro', 'QR Code não possui dados válidos.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        onBarCodeScanned={(data) => {handleBarCodeScanned(data)}}
        style={StyleSheet.absoluteFillObject}
        ratio="16:9"
      />

      <View style={styles.overlay}>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {scanned && <Text style={styles.overlayText}>Escaneado! Redirecionando...</Text>}
    </View>
  );
}

const SIZE = 250;
const CORNER_SIZE = 30;
const BORDER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlayText: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -SIZE / 2,
    marginTop: -SIZE / 2,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'white',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: BORDER_WIDTH,
    borderTopWidth: BORDER_WIDTH,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: BORDER_WIDTH,
    borderTopWidth: BORDER_WIDTH,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: BORDER_WIDTH,
    borderBottomWidth: BORDER_WIDTH,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: BORDER_WIDTH,
    borderBottomWidth: BORDER_WIDTH,
  },
});
