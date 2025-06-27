import { Area } from '@/.expo/types/Docs';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/auth';
import { deleteArea, postArea } from '@/lib/db';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedTextInput } from './ThemedTextInput';
import { ThemedView } from './ThemedView';

interface EditAreaModalProps {
  visible: boolean;
  onClose: () => void;
  onAreaUpdated: () => void;
  onAreaDeleted: () => void;
  area: Area | null;
}

export function EditAreaModal({ 
  visible, 
  onClose, 
  onAreaUpdated, 
  onAreaDeleted, 
  area 
}: EditAreaModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Populate form when area changes
  useEffect(() => {
    if (area) {
      setName(area.name || '');
      setDescription(area.description || '');
    }
  }, [area]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a área.');
      return;
    }

    if (!user?.uid || !area) {
      Alert.alert('Erro', 'Usuário não autenticado ou área não encontrada.');
      return;
    }

    setIsLoading(true);
    try {
      const updatedArea = {
        ...area,
        name: name.trim(),
        description: description.trim(),
      };

      await postArea(user.uid, updatedArea);
      onAreaUpdated();
      onClose();
      Alert.alert('Sucesso', 'Área atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating area:', error);
      Alert.alert('Erro', 'Erro ao atualizar área. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!user?.uid || !area) {
      Alert.alert('Erro', 'Usuário não autenticado ou área não encontrada.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a área "${area.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteArea(user.uid, area.id);
              onAreaDeleted();
              onClose();
              Alert.alert('Sucesso', 'Área excluída com sucesso!');
            } catch (error) {
              console.error('Error deleting area:', error);
              Alert.alert('Erro', 'Erro ao excluir área. Tente novamente.');
            }
          }
        },
      ]
    );
  };

  const handleCancel = () => {
    const hasChanges = 
      name !== (area?.name || '') ||
      description !== (area?.description || '');
    
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

  if (!area) {
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
          <ThemedText style={styles.title}>Editar Área</ThemedText>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <ThemedText style={[styles.cancelText, { color: colors.tint }]}>Cancelar</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.content}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nome da Área *</ThemedText>
            <ThemedTextInput
              style={[styles.input, { backgroundColor: colors.modalInputBg, borderColor: colors.modalBorder }]}
              value={name}
              onChangeText={setName}
              placeholder="Digite o nome da área"
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
              numberOfLines={4}
              maxLength={200}
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
              {isLoading ? 'Excluindo...' : 'Excluir Área'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
    height: 100,
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