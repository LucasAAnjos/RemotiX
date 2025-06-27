import { Equipment } from '@/.expo/types/Docs';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { postEquipment } from '@/lib/db';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedTextInput } from './ThemedTextInput';
import { ThemedView } from './ThemedView';

interface AddEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onEquipmentAdded: () => void;
  plantId: string;
  areaId: string;
}

export function AddEquipmentModal({ 
  visible, 
  onClose, 
  onEquipmentAdded, 
  plantId, 
  areaId 
}: AddEquipmentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('');
  const [driveType, setDriveType] = useState('');
  const [inputSignal, setInputSignal] = useState('');
  const [outputSignal, setOutputSignal] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o equipamento.');
      return;
    }

    setIsLoading(true);
    try {
      const newEquipment: Equipment = {
        id: Date.now().toString(), // Simple ID generation
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date(),
        in_maintenance: false,
      };

      // Only add optional fields if they have values
      if (model.trim()) {
        newEquipment.model = model.trim();
      }
      if (driveType.trim()) {
        newEquipment.driveType = driveType.trim();
      }
      if (inputSignal.trim()) {
        newEquipment.inputSignal = inputSignal.trim();
      }
      if (outputSignal.trim()) {
        newEquipment.outputSignal = outputSignal.trim();
      }
      if (ipAddress.trim()) {
        newEquipment.ipAddress = ipAddress.trim();
      }

      await postEquipment(plantId, areaId, newEquipment);
      
      // Reset form
      setName('');
      setDescription('');
      setModel('');
      setDriveType('');
      setInputSignal('');
      setOutputSignal('');
      setIpAddress('');
      
      // Close modal and notify parent
      onClose();
      onEquipmentAdded();
      
      Alert.alert('Sucesso', 'Equipamento criado com sucesso!');
    } catch (error) {
      console.error('Error creating equipment:', error);
      Alert.alert('Erro', 'Erro ao criar equipamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hasData = name.trim() || description.trim() || model.trim() || 
                   driveType.trim() || inputSignal.trim() || outputSignal.trim() || ipAddress.trim();
    
    if (hasData) {
      Alert.alert(
        'Cancelar',
        'Tem certeza que deseja cancelar? Os dados serão perdidos.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Cancelar', 
            style: 'destructive',
            onPress: () => {
              setName('');
              setDescription('');
              setModel('');
              setDriveType('');
              setInputSignal('');
              setOutputSignal('');
              setIpAddress('');
              onClose();
            }
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <ThemedView style={styles.modalContainer}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.modalBorder }]}>
          <ThemedText style={styles.modalTitle}>Novo Equipamento</ThemedText>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <ThemedText style={[styles.closeButtonText, { color: colors.tint }]}>Cancelar</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.modalLabel}>Nome do Equipamento *</ThemedText>
              <ThemedTextInput
                style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={name}
                onChangeText={setName}
                placeholder="Digite o nome do equipamento"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.modalLabel}>Descrição</ThemedText>
              <ThemedTextInput
                style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Digite uma descrição (opcional)"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.modalLabel}>Modelo</ThemedText>
              <ThemedTextInput
                style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={model}
                onChangeText={setModel}
                placeholder="Digite o modelo (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.modalLabel}>Tipo de Drive</ThemedText>
              <ThemedTextInput
                style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={driveType}
                onChangeText={setDriveType}
                placeholder="Digite o tipo de drive (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.modalLabel}>Sinal de Entrada</ThemedText>
              <ThemedTextInput
                style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={inputSignal}
                onChangeText={setInputSignal}
                placeholder="Digite o sinal de entrada (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.modalLabel}>Sinal de Saída</ThemedText>
              <ThemedTextInput
                style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={outputSignal}
                onChangeText={setOutputSignal}
                placeholder="Digite o sinal de saída (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.modalLabel}>Endereço IP</ThemedText>
              <ThemedTextInput
                style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="Digite o endereço IP (opcional)"
                maxLength={15}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.modalConfirmButton, 
                { backgroundColor: colors.tint },
                isLoading && { backgroundColor: colors.disabled }
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={[styles.modalConfirmButtonText, { color: colors.background }]}>
                {isLoading ? 'Criando...' : 'Criar Equipamento'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  scrollView: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalConfirmButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 