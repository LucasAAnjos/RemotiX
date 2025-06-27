import { Equipment } from "@/.expo/types/Docs";
import { AddEquipmentModal } from '@/components/AddEquipmentModal';
import { EditEquipmentModal } from '@/components/EditEquipmentModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { deleteEquipment, subscribeToEquipments } from '@/lib/db';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function EquipmentScreen() {
  const colorScheme = useColorScheme();
  const { areaId, areaName, plantId } = useLocalSearchParams();
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [filter, setFilter] = useState<null | 'in_maintenance' | 'working'>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  const colors = Colors[colorScheme ?? 'light'];
  const pageBgColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (plantId && areaId) {
      const unsubscribe = subscribeToEquipments(
        plantId as string, 
        areaId as string, 
        (equipments) => {
          setEquipmentList(equipments);
        }
      );
      
      return () => unsubscribe();
    }
  }, [plantId, areaId]);

  const inMaintenance = equipmentList.filter(eq => eq.in_maintenance).length;
  const working = equipmentList.filter(eq => !eq.in_maintenance).length;

  const filteredList = filter === 'in_maintenance'
    ? equipmentList.filter(eq => eq.in_maintenance)
    : filter === 'working'
      ? equipmentList.filter(eq => !eq.in_maintenance)
      : equipmentList;
    
  const handleEquipmentPress = (item: Equipment) => {
    if (isEditMode) {
      // In edit mode, open edit modal
      setSelectedEquipment(item);
      setIsEditModalVisible(true);
    } else {
      // Normal mode, navigate to maintenance
      router.push({ 
        pathname: '/maintenance/[equipmentId]' as any, 
        params: { plantId, areaId, equipmentId: item.id } as any,
      });
    }
  };

  const handleDeleteEquipment = (item: Equipment) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o equipamento "${item.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEquipment(plantId as string, areaId as string, item.id);
              Alert.alert('Sucesso', 'Equipamento excluído com sucesso!');
            } catch (error) {
              console.error('Error deleting equipment:', error);
              Alert.alert('Erro', 'Erro ao excluir equipamento. Tente novamente.');
            }
          }
        },
      ]
    );
  };

  const handleAddEquipment = () => {
    setIsModalVisible(true);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleEquipmentAdded = () => {
    // The real-time subscription will automatically update the list
    // No need to manually refresh
  };

  const handleEquipmentUpdated = () => {
    // The real-time subscription will automatically update the list
    // No need to manually refresh
  };

  const handleEquipmentDeleted = () => {
    // The real-time subscription will automatically update the list
    // No need to manually refresh
  };

  const renderEquipmentItem = ({ item }: { item: any }) => {
    // Determine status and color
    const isActive = !item.in_maintenance;
    const statusColor = isActive ? colors.active : colors.maintenance;
    const statusBgColor = isActive ? colors.activeBadgeBg : colors.maintenanceBadgeBg;

    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => handleEquipmentPress(item)}
        style={[
          styles.equipmentCardRow,
          { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
          isEditMode && { backgroundColor: colors.editModeBg }
        ]}
      >
        {/* Icon with background */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: statusBgColor }]}> 
            <IconSymbol name={isActive ? "double.arrow" : "wrench"} size={22} color={statusColor} />
          </View>
        </View>
        <View style={styles.cardContent}>
          <ThemedText type="default" style={styles.equipmentName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText type="default" style={styles.equipmentDescription} numberOfLines={1}>
            {item.description ?? '-'}
          </ThemedText>
        </View>
        {/* Edit Icon - only show in edit mode */}
        {isEditMode && (
          <View style={styles.editButtonContainer}>
            <IconSymbol name="edit" size={20} color={colors.editFabActive} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `${areaName}`,
          headerShown: true, 
          headerTintColor: Colors[colorScheme ?? 'light'].headerTint,
          headerStyle: {
            backgroundColor: colorScheme === 'dark'
              ? '#111'
              : Colors[colorScheme ?? 'light'].tint,
          }
        }} 
      />
      <View style={[styles.container, { backgroundColor: pageBgColor }]}>
        {/* Summary Section as Badges */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* In Maintenance Badge */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter(filter === 'in_maintenance' ? null : 'in_maintenance')}
          >
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: filter === 'in_maintenance' ? colors.maintenance : colors.maintenanceBadgeBg,
              borderRadius: 20,
              paddingVertical: 6,
              paddingHorizontal: 12,
              minWidth: 60,
              borderWidth: filter === 'in_maintenance' ? 2 : 0,
              borderColor: filter === 'in_maintenance' ? colors.maintenanceBadgeBorder : 'transparent',
            }}>
              <IconSymbol name="wrench" size={16} color={filter === 'in_maintenance' ? colors.background : colors.maintenance} style={{ marginRight: 6 }} />
              <ThemedText type="default" style={{ fontWeight: 'bold', color: filter === 'in_maintenance' ? colors.background : colors.maintenance, fontSize: 14 }}>{inMaintenance}</ThemedText>
              <ThemedText type="default" style={{ color: filter === 'in_maintenance' ? colors.background : colors.maintenance, fontSize: 13, marginLeft: 4 }}>Em manutenção</ThemedText>
            </ThemedView>
          </TouchableOpacity>
          {/* Working Badge */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter(filter === 'working' ? null : 'working')}
          >
            <ThemedView style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: filter === 'working' ? colors.active : colors.activeBadgeBg,
              borderRadius: 20,
              paddingVertical: 6,
              paddingHorizontal: 12,
              minWidth: 60,
              borderWidth: filter === 'working' ? 2 : 0,
              borderColor: filter === 'working' ? colors.activeBadgeBorder : 'transparent',
            }}>
              <IconSymbol name="double.arrow" size={16} color={filter === 'working' ? colors.background : colors.active} style={{ marginRight: 6 }} />
              <ThemedText type="default" style={{ fontWeight: 'bold', color: filter === 'working' ? colors.background : colors.active, fontSize: 14 }}>{working}</ThemedText>
              <ThemedText type="default" style={{ color: filter === 'working' ? colors.background : colors.active, fontSize: 13, marginLeft: 4 }}>Ativos</ThemedText>
            </ThemedView>
          </TouchableOpacity>
          {/* Clear Filter Badge */}
          {filter && (
            <TouchableOpacity onPress={() => setFilter(null)} activeOpacity={0.7}>
              <ThemedView style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: colors.clearFilterBg, 
                borderRadius: 20, 
                paddingVertical: 6, 
                paddingHorizontal: 12, 
                minWidth: 60, 
                borderWidth: 1, 
                borderColor: colors.clearFilterBorder 
              }}>
                <IconSymbol name="chevron.right" size={16} color={colors.clearFilterText} style={{ marginRight: 6, transform: [{ rotate: '90deg' }] }} />
                <ThemedText type="default" style={{ color: colors.clearFilterText, fontSize: 13 }}>Limpar filtro</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
        </View>
        <FlatList 
          data={filteredList}
          renderItem={renderEquipmentItem}
          contentContainerStyle={styles.listContainer}
        />
        
        {/* Add Equipment FAB */}
        <FloatingActionButton 
          onPress={handleAddEquipment}
          iconName="plus"
          style={styles.addFab}
        />
        
        {/* Edit Mode Toggle FAB */}
        <FloatingActionButton 
          onPress={handleToggleEditMode}
          iconName={isEditMode ? "checkmark" : "edit"}
          style={isEditMode ? { ...styles.editFabActive, backgroundColor: colors.saveFab } : styles.editFab}
        />
        
        <AddEquipmentModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onEquipmentAdded={handleEquipmentAdded}
          plantId={plantId as string}
          areaId={areaId as string}
        />
        
        <EditEquipmentModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedEquipment(null);
          }}
          onEquipmentUpdated={handleEquipmentUpdated}
          onEquipmentDeleted={handleEquipmentDeleted}
          plantId={plantId as string}
          areaId={areaId as string}
          equipment={selectedEquipment}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    gap: 12,
  },
  equipmentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  equipmentDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  maintenanceCount: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
  },
  editButtonContainer: {
    padding: 8,
    marginLeft: 8,
  },
  addFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  editFab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
  editFabActive: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
}); 