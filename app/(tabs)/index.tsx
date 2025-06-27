import { Area } from '@/.expo/types/Docs';
import { AddAreaModal } from '@/components/AddAreaModal';
import { EditAreaModal } from '@/components/EditAreaModal';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/lib/auth';
import { getUserPlant, subscribeToAreas } from '@/lib/db';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

function StatusDot({ color, count, pulse }: { color: string; count: number; pulse?: boolean }) {
  const colorScheme = useColorScheme();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (pulse && count > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [pulse, count, pulseAnim]);

  const dotColor = count === 0 ? Colors[colorScheme ?? 'light'].dotInactive : color;
  if (pulse && count > 0) {
    return (
      <Animated.View style={[styles.dot, { backgroundColor: dotColor, transform: [{ scale: pulseAnim }] }]} />
    );
  }
  return <View style={[styles.dot, { backgroundColor: dotColor }]} />;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [plantId, setPlantId] = useState<string | null>(null);
  const [areaList, setAreaList] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Theme-aware status colors
  const maintenanceColor = useThemeColor({ light: Colors.light.maintenance, dark: Colors.dark.maintenance }, 'text');
  const activeColor = useThemeColor({ light: Colors.light.active, dark: Colors.dark.active }, 'text');
  const inactiveColor = useThemeColor({ light: Colors.light.inactive, dark: Colors.dark.inactive }, 'icon');
  const editModeBgColor = useThemeColor({ light: Colors.light.editModeBg, dark: Colors.dark.editModeBg }, 'background');
  const editFabActiveColor = useThemeColor({ light: Colors.light.editFabActive, dark: Colors.dark.editFabActive }, 'tint');
  const saveFabColor = useThemeColor({ light: Colors.light.saveFab, dark: Colors.dark.saveFab }, 'text');
  const cardBgColor = useThemeColor({ light: Colors.light.cardBackground, dark: Colors.dark.cardBackground }, 'background');
  const cardBorderColor = useThemeColor({ light: Colors.light.cardBorder, dark: Colors.dark.cardBorder }, 'icon');
  const pageBgColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (user?.uid) {
      let unsubscribe: (() => void) | undefined;
      
      getUserPlant(user.uid).then((plant) => {
        setPlantId(plant);
        
        // Subscribe to areas with real-time updates
        unsubscribe = subscribeToAreas(plant, (areas) => {
          setAreaList(areas);
        });
      });
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [user?.uid]);

  const handleAreaPress = (area: any) => {
    if (isEditMode) {
      // In edit mode, open edit modal
      setSelectedArea(area);
      setIsEditModalVisible(true);
    } else {
      // Normal mode, navigate to equipment
      router.push({
        pathname: '../equipment',
        params: { areaId: area.id, areaName: area.name, plantId }
      });
    }
  };

  const handleAddArea = () => {
    setIsModalVisible(true);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleAreaAdded = () => {
    // The real-time subscription will automatically update the list
    // No need to manually refresh
  };

  const handleAreaUpdated = () => {
    // The real-time subscription will automatically update the list
    // No need to manually refresh
  };

  const handleAreaDeleted = () => {
    // The real-time subscription will automatically update the list
    // No need to manually refresh
  };

  const renderItem = ({ item }: { item: any }) => {
    const inMaintenanceCount = item.equipments?.filter((eq: any) => eq.in_maintenance).length || 0;
    const runningCount = item.equipments.length - inMaintenanceCount;
    return (
      <TouchableOpacity 
        onPress={() => handleAreaPress(item)}
        style={[
          styles.itemContainer,
          { backgroundColor: cardBgColor, borderColor: cardBorderColor },
          isEditMode && { backgroundColor: editModeBgColor }
        ]}
      >
        <View style={styles.itemContent}>
          <ThemedText style={styles.areaName}>{item.name}</ThemedText>
          {item.description ? (
            <ThemedText style={styles.areaDescription}>{item.description}</ThemedText>
          ) : null}
          <View style={styles.badgeRow}>
            <StatusDot color={maintenanceColor} count={inMaintenanceCount} pulse />
            <ThemedText style={styles.badgeLabel}>Em manutenção: {inMaintenanceCount}</ThemedText>
            <StatusDot color={activeColor} count={runningCount} />
            <ThemedText style={styles.badgeLabel}>Funcionando: {runningCount}</ThemedText>
          </View>
        </View>
        {/* Edit Icon - only show in edit mode */}
        {isEditMode && (
          <View style={styles.editIconContainer}>
            <IconSymbol name="edit" size={20} color={editFabActiveColor} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: pageBgColor }]}>
      <FlatList
        data={areaList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      {/* Add Area FAB */}
      <FloatingActionButton 
        onPress={handleAddArea}
        iconName="plus"
        style={styles.addFab}
      />
      
      {/* Edit Mode Toggle FAB */}
      <FloatingActionButton 
        onPress={handleToggleEditMode}
        iconName={isEditMode ? "checkmark" : "edit"}
        style={isEditMode ? { ...styles.editFabActive, backgroundColor: saveFabColor } : styles.editFab}
      />
      
      <AddAreaModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAreaAdded={handleAreaAdded}
      />
      
      <EditAreaModal
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedArea(null);
        }}
        onAreaUpdated={handleAreaUpdated}
        onAreaDeleted={handleAreaDeleted}
        area={selectedArea}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    gap: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  areaDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeLabel: {
    fontSize: 13,
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  editIconContainer: {
    padding: 16,
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
