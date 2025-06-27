import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/auth';
import { postArea } from '@/lib/db';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AddAreaModalProps {
  visible: boolean;
  onClose: () => void;
  onAreaAdded: () => void;
}

export function AddAreaModal({ visible, onClose, onAreaAdded }: AddAreaModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a área.');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    setIsLoading(true);
    try {
      const newArea = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date(),
        equipments: [],
      };
      
      await postArea(user.uid, newArea);
      setName('');
      setDescription('');
      onAreaAdded();
      onClose();
      Alert.alert('Sucesso', 'Área criada com sucesso!');
    } catch (error) {
      console.error('Error adding area:', error);
      Alert.alert('Erro', 'Erro ao criar área. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalContainer}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.modalBorder }]}>
          <ThemedText style={styles.modalTitle}>Nova Área</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={[styles.closeButtonText, { color: colors.tint }]}>Cancelar</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <ThemedText style={styles.modalLabel}>
            Nome da Área *
          </ThemedText>
          <ThemedTextInput
            style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
            value={name}
            onChangeText={setName}
            placeholder="Digite o nome da área..."
            maxLength={50}
          />
          
          <ThemedText style={styles.modalLabel}>
            Descrição (opcional)
          </ThemedText>
          <ThemedTextInput
            style={[styles.modalInput, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Digite uma descrição..."
            maxLength={200}
          />
          
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
              {isLoading ? 'Criando...' : 'Criar Área'}
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  modalContent: {
    padding: 20,
    gap: 16,
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