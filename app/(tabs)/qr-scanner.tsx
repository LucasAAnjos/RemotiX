import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/auth';
import { findEquipmentById, getUserPlant } from '@/lib/db';

export default function QRScannerScreen() {
  const colorScheme = useColorScheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].blackBackground }]}>
        <Stack.Screen 
          options={{ 
            title: 'Scanner QR',
            headerShown: true,
            headerTintColor: Colors[colorScheme ?? 'light'].headerTint,
            headerStyle: {
              backgroundColor: colorScheme === 'dark'
                ? '#111'
                : Colors[colorScheme ?? 'light'].tint,
            }
          }} 
        />
        <View style={styles.permissionContainer}>
          <IconSymbol name="camera" size={64} color={Colors[colorScheme ?? 'light'].iconDefault} />
          <ThemedText type="default" style={styles.permissionTitle}>
            Permissão de Câmera Necessária
          </ThemedText>
          <ThemedText type="default" style={styles.permissionText}>
            Para escanear códigos QR de equipamentos, precisamos de permissão para acessar sua câmera.
          </ThemedText>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <ThemedText style={[styles.permissionButtonText, { color: Colors[colorScheme ?? 'light'].headerTint }]}>
              Conceder Permissão
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isSearching) return;
    
    setScanned(true);
    setIsSearching(true);
    
    try {
      // Validate that the scanned data looks like an equipment ID
      if (!data || data.trim().length === 0) {
        Alert.alert('Erro', 'Código QR inválido. Tente novamente.');
        setScanned(false);
        setIsSearching(false);
        return;
      }

      const equipmentId = data.trim();
      
      // Get user's plant ID
      if (!user?.uid) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        setScanned(false);
        setIsSearching(false);
        return;
      }

      const plantId = await getUserPlant(user.uid);
      
      // Search for the equipment
      const result = await findEquipmentById(plantId, equipmentId);
      
      if (result) {
        const { equipment, areaId } = result;
        
        Alert.alert(
          'Equipamento Encontrado',
          `Equipamento: ${equipment.name}\nÁrea: ${areaId}\n\nRedirecionando para a página de manutenção...`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate directly to the equipment maintenance page
                router.push({
                  pathname: '/maintenance/[equipmentId]' as any,
                  params: { 
                    plantId, 
                    areaId, 
                    equipmentId: equipment.id 
                  } as any,
                });
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Equipamento Não Encontrado',
          `Nenhum equipamento encontrado com o ID: ${equipmentId}\n\nVerifique se o código QR está correto.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setScanned(false);
                setIsSearching(false);
              }
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Erro', 'Erro ao processar código QR. Tente novamente.');
      setScanned(false);
      setIsSearching(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setIsSearching(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].blackBackground }]}>
      <Stack.Screen 
        options={{ 
          title: 'Scanner QR',
          headerShown: true,
          headerTintColor: Colors[colorScheme ?? 'light'].headerTint,
          headerStyle: {
            backgroundColor: colorScheme === 'dark'
              ? '#111'
              : Colors[colorScheme ?? 'light'].tint,
          }
        }} 
      />
      
      <View style={styles.cameraContainer}>
        {isScreenFocused && (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
        )}
        <View style={[styles.overlay, { backgroundColor: Colors[colorScheme ?? 'light'].overlay }]}> 
          <View style={styles.scanFrame}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <ThemedText style={[styles.scanText, { 
            color: Colors[colorScheme ?? 'light'].headerTint,
            backgroundColor: Colors[colorScheme ?? 'light'].overlayDark 
          }]}> 
            {isSearching ? 'Procurando equipamento...' : 'Posicione o código QR dentro da área'}
          </ThemedText>
        </View>
      </View>

      {scanned && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.scanAgainButton}
            onPress={handleScanAgain}
          >
            <IconSymbol name="arrow.clockwise" size={20} color={Colors[colorScheme ?? 'light'].headerTint} />
            <ThemedText style={[styles.scanAgainButtonText, { color: Colors[colorScheme ?? 'light'].headerTint }]}>
              Escanear Novamente
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  permissionButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.light.tint,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    top: 'auto',
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  cornerBottomRight: {
    top: 'auto',
    bottom: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  scanText: {
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  scanAgainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 