import type { Equipment } from '@/.expo/types/Docs';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/lib/auth';
import { getUserData, patchEquipment, postMaintenance, subscribeToEquipment } from '@/lib/db';
import { createEquipmentWebSocket, EquipmentWebSocket } from '@/lib/ws';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const StatusMap: { [key: number]: string } = {
  0: 'Desligado',
  1: 'Ligado',
}

const WS_URL_KEY = 'equipment_ws_url';

export default function MaintenanceControlScreen() {
  const colorScheme = useColorScheme();
  const { plantId, areaId, equipmentId } = useLocalSearchParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [finishDescription, setFinishDescription] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [status, setStatus] = useState(0);
  const [bits, setBits] = useState(null);
  const ws = useRef<EquipmentWebSocket | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsConnecting, setWsConnecting] = useState(true);
  const [wsUrl, setWsUrl] = useState('ws://0.0.0.0:8080');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(wsUrl);

  // Theme-aware colors
  const powerButtonColor = useThemeColor({ light: Colors.light.powerButton, dark: Colors.dark.powerButton }, 'tint');
  const powerButtonActiveColor = useThemeColor({ light: Colors.light.powerButtonActive, dark: Colors.dark.powerButtonActive }, 'text');
  const buttonTextColor = useThemeColor({}, 'background');
  const alarmBadgeOffColor = useThemeColor({ light: Colors.light.alarmBadgeOff, dark: Colors.dark.alarmBadgeOff }, 'background');
  const alarmBadgeOnColor = useThemeColor({ light: Colors.light.alarmBadgeOn, dark: Colors.dark.alarmBadgeOn }, 'text');
  const alarmBadgeBorderColor = useThemeColor({ light: Colors.light.alarmBadgeBorder, dark: Colors.dark.alarmBadgeBorder }, 'icon');
  const alarmBadgeOnBorderColor = useThemeColor({ light: Colors.light.alarmBadgeOnBorder, dark: Colors.dark.alarmBadgeOnBorder }, 'text');
  const alarmIconColor = useThemeColor({ light: Colors.light.alarmIcon, dark: Colors.dark.alarmIcon }, 'icon');
  const warningBgColor = useThemeColor({ light: Colors.light.warningBg, dark: Colors.dark.warningBg }, 'background');
  const warningBorderColor = useThemeColor({ light: Colors.light.warningBorder, dark: Colors.dark.warningBorder }, 'text');
  const warningTextColor = useThemeColor({ light: Colors.light.warningText, dark: Colors.dark.warningText }, 'text');
  const finishButtonColor = useThemeColor({ light: Colors.light.maintenance, dark: Colors.dark.maintenance }, 'text');
  const modalBorderColor = useThemeColor({ light: Colors.light.modalBorder, dark: Colors.dark.modalBorder }, 'icon');
  const modalInputBgColor = useThemeColor({ light: Colors.light.modalInputBg, dark: Colors.dark.modalInputBg }, 'background');
  const disabledColor = useThemeColor({ light: Colors.light.disabled, dark: Colors.dark.disabled }, 'icon');
  const screenBackgroundColor = useThemeColor({ light: '#f2f5fa', dark: '#181a20' }, 'background');
  const cardBackgroundColor = useThemeColor({ light: Colors.light.cardBackground, dark: Colors.dark.cardBackground }, 'background');
  const cardBorderColor = useThemeColor({ light: Colors.light.cardBorder, dark: Colors.dark.cardBorder }, 'icon');
  const themedTextColor = useThemeColor({}, 'text');
  const buttonBgColor = useThemeColor({}, 'background');
  const cardShadow = colorScheme === 'dark' ? {} : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  };
  const statusOffColor = useThemeColor({ light: '#1a2952', dark: '#ECEDEE' }, 'text');
  const statusOnColor = useThemeColor({ light: '#0a8a0a', dark: Colors.dark.active }, 'active');
  const statusDesligadoColor = useThemeColor({ light: '#1a2952', dark: '#ECEDEE' }, 'text');
  const statusLigadoColor = useThemeColor({ light: '#0a8a0a', dark: Colors.dark.active }, 'active');
  const ligarButtonColor = Colors.light.active;
  const desligarButtonColor = Colors.light.maintenance;
  const finalizarButtonColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const wsUrlTextColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const wsConnectedColor = useThemeColor({ light: '#2ecc40', dark: '#2ecc40' }, 'active');
  const modalBgColor = useThemeColor({}, 'background');
  const modalTextColor = useThemeColor({}, 'text');
  const modalInputBorderColor = useThemeColor({ light: Colors.light.cardBorder, dark: Colors.dark.cardBorder }, 'icon');
  const modalCancelColor = useThemeColor({ light: '#888', dark: '#aaa' }, 'text');

  useEffect(() => {
    if (plantId && areaId && equipmentId) {
      const unsubscribeEquipment = subscribeToEquipment(
        plantId as string,
        areaId as string,
        equipmentId as string,
        (equipmentData) => {
          setEquipment(equipmentData);
        }
      );

      return () => {
        unsubscribeEquipment();
      };
    }
  }, [plantId, areaId, equipmentId]);

  useEffect(() => {
    (async () => {
      const storedUrl = await AsyncStorage.getItem(WS_URL_KEY);
      if (storedUrl) {
        setWsUrl(storedUrl);
      }
    })();
  }, []);

  useEffect(() => {
    if (!wsUrl) return;
    setWsError(null);
    setWsConnecting(true);
    ws.current = createEquipmentWebSocket(
      wsUrl,
      (status, bits) => {
        setStatus(Number(status));
        setBits(bits);
      },
      (err: any) => {
        let msg = 'Erro de conexão WebSocket';
        if (err && err.message) msg = err.message;
        setWsError(msg);
        setWsConnecting(false);
        console.error('WebSocket erro:', err);
      },
      () => {
        setWsError(null);
        setWsConnecting(false);
        console.log('WebSocket conectado');
      },
      () => console.log('WebSocket fechado')
    );
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [wsUrl]);

  const sendCommand = (command: number) => {
    if (!ws.current || !ws.current.isOpen()) {
      Alert.alert('Erro', 'WebSocket desconectado');
      return;
    }
    if (!equipment?.name) {
      Alert.alert('Erro', 'Tag do equipamento não informada');
      return;
    }
    try {
      ws.current.sendCommand(equipment.name, command);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao enviar comando: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleFinishMaintenance = async () => {
    if (!equipment) return;

    if (!finishDescription.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição da manutenção realizada.');
      return;
    }

    Alert.alert(
      'Finalizar Manutenção',
      'Tem certeza que deseja finalizar a manutenção? O equipamento será marcado como ativo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Update equipment status
              await patchEquipment(
                plantId as string,
                areaId as string,
                equipmentId as string,
                { in_maintenance: false }
              );

              // Get user data from Firestore
              let userName = 'unknown_user';
              if (user?.uid) {
                try {
                  const userData = await getUserData(user.uid);
                  userName = userData.name || user.email || 'unknown_user';
                } catch (error) {
                  console.error('Error getting user data:', error);
                  userName = user.email || 'unknown_user';
                }
              }

              // Create maintenance record
              await postMaintenance(
                plantId as string,
                areaId as string,
                equipmentId as string,
                {
                  description: finishDescription.trim(),
                  user: userName,
                }
              );

              // Navigate back to equipment list
              router.back();

            } catch (error) {
              console.error('Error finishing maintenance:', error);
              Alert.alert('Erro', 'Erro ao finalizar manutenção. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleOpenFinishModal = () => {
    setShowFinishModal(true);
  };

  const handleCloseFinishModal = () => {
    setShowFinishModal(false);
    setFinishDescription('');
  };

  const openUrlModal = () => {
    setPendingUrl(wsUrl);
    setShowUrlModal(true);
  };

  const closeUrlModal = () => {
    setShowUrlModal(false);
  };

  const confirmUrlModal = async () => {
    const trimmed = pendingUrl.trim();
    setShowUrlModal(false);
    setWsUrl(trimmed);
    await AsyncStorage.setItem(WS_URL_KEY, trimmed);
  };

  if (!equipment) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{
        title: `Controle`,
        headerTintColor: Colors[colorScheme ?? 'light'].headerTint,
        headerStyle: {
          backgroundColor: colorScheme === 'dark'
            ? '#111'
            : Colors[colorScheme ?? 'light'].tint,
        }
      }} />
      <View style={[styles2.screen, { backgroundColor: screenBackgroundColor }]}>
        {/* Equipment Icon */}
        <View style={styles2.iconContainer}>
          {wsError ? (
            <Image source={require('@/assets/images/motor-fault.png')} style={{ width: 96, height: 96 }} accessibilityLabel="Motor com Falha" />
          ) : status === 1 ? (
            <Image source={require('@/assets/images/motor-on.png')} style={{ width: 96, height: 96 }} accessibilityLabel="Motor Ligado" />
          ) : (
            <Image source={require('@/assets/images/motor-off.png')} style={{ width: 96, height: 96 }} accessibilityLabel="Motor Desligado" />
          )}
        </View>
        {/* Info Card */}
        <View style={[
          styles2.infoCard,
          {
            backgroundColor: cardBackgroundColor,
            borderColor: cardBorderColor,
            borderWidth: 1,
            borderRadius: 12,
            padding: 20,
          },
        ]}>
          <ThemedText style={[styles2.infoText, { color: themedTextColor }]}>
            Retroaviso: <ThemedText style={[styles2.infoValue, { color: statusOffColor }]}>OFF</ThemedText>{'\n'}
            Alarme 1: <ThemedText style={[styles2.infoValue, { color: statusOffColor }]}>OFF</ThemedText>{'\n'}
            Alarme 2: <ThemedText style={[styles2.infoValue, { color: statusOffColor }]}>OFF</ThemedText>{'\n'}
            Status: <ThemedText style={[styles2.infoValue, { color: status === 1 ? statusLigadoColor : statusDesligadoColor }]}>{StatusMap[status]}</ThemedText>
          </ThemedText>
        </View>
        {/* WebSocket URL Display with Edit Icon */}
        <TouchableOpacity onPress={openUrlModal}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <ThemedText style={{ color: wsUrlTextColor, fontWeight: 'bold' }}>
              {wsUrl}
            </ThemedText>
            <MaterialIcons name="edit" size={20} color={wsUrlTextColor} />
          </View>
        </TouchableOpacity>
        {/* Spacer to push content up above buttons */}
        <View style={{ flex: 1 }} />
        {/* Fixed Button Bar */}
        <SafeAreaView edges={['bottom']} style={styles2.buttonBar}>
          {wsConnecting && !wsError && (
            <View style={{ marginBottom: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={wsUrlTextColor} style={{ marginRight: 8 }} />
              <ThemedText style={{ color: wsUrlTextColor }}>Conectando ao WebSocket...</ThemedText>
            </View>
          )}
          {!wsConnecting && !wsError && (
            <View style={{ marginBottom: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              <MaterialIcons name="check-circle" size={18} color={wsConnectedColor} style={{ marginRight: 6 }} />
              <ThemedText style={{ color: wsConnectedColor, fontWeight: 'bold' }}>WebSocket conectado</ThemedText>
            </View>
          )}
          {wsError && (
            <View style={{ marginBottom: 8, backgroundColor: '#ffeaea', borderColor: '#ff4d4f', borderWidth: 1, borderRadius: 8, padding: 8 }}>
              <ThemedText style={{ color: '#b71c1c', textAlign: 'center' }}>
                {wsError.includes('failed to connect') ? 'Falha ao conectar ao WebSocket. \nVerifique o endereço e a rede.' : wsError}
              </ThemedText>
            </View>
          )}
          <View style={styles2.buttonRow}>
            <TouchableOpacity style={[styles2.actionButton, { backgroundColor: ligarButtonColor }]}
              onPress={() => sendCommand(1)}
              disabled={!!wsError || wsConnecting}
            >
              <ThemedText style={[styles2.buttonText, { color: '#fff', opacity: wsError || wsConnecting ? 0.5 : 1 }]}>Ligar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles2.actionButton, { backgroundColor: desligarButtonColor }]}
              onPress={() => sendCommand(2)}
              disabled={!!wsError || wsConnecting}
            >
              <ThemedText style={[styles2.buttonText, { color: '#fff', opacity: wsError || wsConnecting ? 0.5 : 1 }]}>Desligar</ThemedText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles2.finalizarButton, { backgroundColor: finalizarButtonColor }]}
            onPress={handleOpenFinishModal}
          >
            <ThemedText style={[styles2.buttonText, { color: buttonBgColor }]}>Finalizar Manutenção</ThemedText>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
      {/* Finish Maintenance Modal */}
      <Modal
        visible={showFinishModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseFinishModal}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: modalBorderColor }]}>
            <ThemedText style={styles.modalTitle}>Finalizar Manutenção</ThemedText>
            <TouchableOpacity onPress={handleCloseFinishModal} style={styles.closeButton}>
              <ThemedText style={[styles.closeButtonText, { color: powerButtonColor }]}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalLabel}>
              Descrição da Manutenção *
            </ThemedText>
            <ThemedTextInput
              style={[styles.modalDescriptionInput, { backgroundColor: modalInputBgColor, borderColor: modalBorderColor }]}
              value={finishDescription}
              onChangeText={setFinishDescription}
              placeholder="Descreva o que foi feito na manutenção..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                { backgroundColor: finishButtonColor },
                isLoading && { backgroundColor: disabledColor }
              ]}
              onPress={handleFinishMaintenance}
              disabled={isLoading}
            >
              <ThemedText style={[styles.modalConfirmButtonText, { color: buttonTextColor }]}>
                {isLoading ? 'Finalizando...' : 'Finalizar Manutenção'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </Modal>
      {/* WebSocket URL Modal */}
      <Modal
        visible={showUrlModal}
        animationType="slide"
        transparent
        onRequestClose={closeUrlModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: modalBgColor, padding: 24, borderRadius: 12, width: '85%' }}>
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: modalTextColor }}>Configurar WebSocket URL</ThemedText>
            <ThemedTextInput
              value={pendingUrl}
              onChangeText={setPendingUrl}
              placeholder="ws://0.0.0.0:8080"
              style={{ borderWidth: 1, borderColor: modalInputBorderColor, borderRadius: 8, padding: 8, marginBottom: 16 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={closeUrlModal} style={{ padding: 10 }}>
                <ThemedText style={{ color: modalCancelColor, fontWeight: 'bold' }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmUrlModal} style={{ padding: 10 }}>
                <ThemedText style={{ color: wsUrlTextColor, fontWeight: 'bold' }}>Confirmar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles2 = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  infoCard: {
    marginHorizontal: 4,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '400',
  },
  infoValue: {
    fontWeight: 'bold',
  },
  buttonBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  finalizarButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  equipmentInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  equipmentName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  equipmentDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  controlSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  powerButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
  },
  powerButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  powerStatus: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  actionsSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalDescriptionInput: {
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalConfirmButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alarmSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  alarmBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  alarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    minWidth: 100,
    borderWidth: 1,
  },
  alarmBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 