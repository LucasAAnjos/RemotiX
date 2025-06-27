import { Equipment } from '@/.expo/types/Docs';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { deleteEquipment, patchEquipment } from '@/lib/db';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedTextInput } from './ThemedTextInput';
import { ThemedView } from './ThemedView';

interface EditEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  onEquipmentUpdated: () => void;
  onEquipmentDeleted: () => void;
  plantId: string;
  areaId: string;
  equipment: Equipment | null;
}

export function EditEquipmentModal({ 
  visible, 
  onClose, 
  onEquipmentUpdated, 
  onEquipmentDeleted, 
  plantId, 
  areaId, 
  equipment 
}: EditEquipmentModalProps) {
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

  // Populate form when equipment changes
  useEffect(() => {
    if (equipment) {
      setName(equipment.name || '');
      setDescription(equipment.description || '');
      setModel(equipment.model || '');
      setDriveType(equipment.driveType || '');
      setInputSignal(equipment.inputSignal || '');
      setOutputSignal(equipment.outputSignal || '');
      setIpAddress(equipment.ipAddress || '');
    }
  }, [equipment]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o equipamento.');
      return;
    }

    if (!equipment) {
      Alert.alert('Erro', 'Equipamento não encontrado.');
      return;
    }

    setIsLoading(true);
    try {
      const updatedEquipment: Partial<Equipment> = {
        name: name.trim(),
        description: description.trim(),
      };

      // Only add optional fields if they have values
      if (model.trim()) {
        updatedEquipment.model = model.trim();
      }
      if (driveType.trim()) {
        updatedEquipment.driveType = driveType.trim();
      }
      if (inputSignal.trim()) {
        updatedEquipment.inputSignal = inputSignal.trim();
      }
      if (outputSignal.trim()) {
        updatedEquipment.outputSignal = outputSignal.trim();
      }
      if (ipAddress.trim()) {
        updatedEquipment.ipAddress = ipAddress.trim();
      }

      await patchEquipment(plantId, areaId, equipment.id, updatedEquipment);
      
      // Close modal and notify parent
      onClose();
      onEquipmentUpdated();
      
      Alert.alert('Sucesso', 'Equipamento atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating equipment:', error);
      Alert.alert('Erro', 'Erro ao atualizar equipamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!equipment) {
      Alert.alert('Erro', 'Equipamento não encontrado.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o equipamento "${equipment.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteEquipment(plantId, areaId, equipment.id);
              
              // Close modal and notify parent
              onClose();
              onEquipmentDeleted();
              
              Alert.alert('Sucesso', 'Equipamento excluído com sucesso!');
            } catch (error) {
              console.error('Error deleting equipment:', error);
              Alert.alert('Erro', 'Erro ao excluir equipamento. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleCancel = () => {
    const hasChanges = 
      name !== (equipment?.name || '') ||
      description !== (equipment?.description || '') ||
      model !== (equipment?.model || '') ||
      driveType !== (equipment?.driveType || '') ||
      inputSignal !== (equipment?.inputSignal || '') ||
      outputSignal !== (equipment?.outputSignal || '') ||
      ipAddress !== (equipment?.ipAddress || '');
    
    if (hasChanges) {
      Alert.alert(
        'Cancelar',
        'Tem certeza que deseja cancelar? As alterações serão perdidas.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Cancelar', 
            style: 'destructive',
            onPress: onClose
          },
        ]
      );
    } else {
      onClose();
    }
  };

  if (!equipment) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={[styles.header, { borderBottomColor: colors.modalBorder }]}>
          <ThemedText style={styles.title}>Editar Equipamento</ThemedText>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <ThemedText style={[styles.cancelText, { color: colors.tint }]}>Cancelar</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Nome do Equipamento *</ThemedText>
              <ThemedTextInput
                style={[styles.input, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={name}
                onChangeText={setName}
                placeholder="Digite o nome do equipamento"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Descrição</ThemedText>
              <ThemedTextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Digite uma descrição (opcional)"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Modelo</ThemedText>
              <ThemedTextInput
                style={[styles.input, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={model}
                onChangeText={setModel}
                placeholder="Digite o modelo (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Tipo de Drive</ThemedText>
              <ThemedTextInput
                style={[styles.input, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={driveType}
                onChangeText={setDriveType}
                placeholder="Digite o tipo de drive (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Sinal de Entrada</ThemedText>
              <ThemedTextInput
                style={[styles.input, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={inputSignal}
                onChangeText={setInputSignal}
                placeholder="Digite o sinal de entrada (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Sinal de Saída</ThemedText>
              <ThemedTextInput
                style={[styles.input, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={outputSignal}
                onChangeText={setOutputSignal}
                placeholder="Digite o sinal de saída (opcional)"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Endereço IP</ThemedText>
              <ThemedTextInput
                style={[styles.input, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="Digite o endereço IP (opcional)"
                maxLength={15}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton, 
                { backgroundColor: colors.tint },
                isLoading && { backgroundColor: colors.disabled }
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={[styles.submitButtonText, { color: colors.background }]}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.deleteButton, 
                { backgroundColor: colors.error },
                isLoading && { backgroundColor: colors.disabled }
              ]}
              onPress={handleDelete}
              disabled={isLoading}
            >
              <ThemedText style={[styles.deleteButtonText, { color: 'white' }]}>
                {isLoading ? 'Excluindo...' : 'Excluir Equipamento'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 