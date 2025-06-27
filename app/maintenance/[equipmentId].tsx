import { EquipamentBadges } from '@/components/EquipamentBadges';
import { MaintenanceHistoryDrawer } from '@/components/MaintenanceHistoryDrawer';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { patchEquipment, subscribeToEquipment, subscribeToMaintenance } from '@/lib/db';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Equipment, Maintenance } from '../../.expo/types/Docs';

export default function ParallaxMaintenanceScreen() {
  const colorScheme = useColorScheme();
  const { plantId, areaId, equipmentId } = useLocalSearchParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>([]);
  const router = useRouter();

  // Theme-aware colors
  const maintenanceButtonColor = useThemeColor({ light: Colors.light.powerButton, dark: Colors.dark.powerButton }, 'tint');
  const maintenanceActiveColor = useThemeColor({ light: Colors.light.powerButtonActive, dark: Colors.dark.powerButtonActive }, 'text');
  const buttonTextColor = 'white';
  const screenBackgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (plantId && areaId && equipmentId) {
      // Subscribe to equipment updates
      const unsubscribeEquipment = subscribeToEquipment(
        plantId as string,
        areaId as string,
        equipmentId as string,
        (equipmentData) => {
          setEquipment(equipmentData);
        }
      );

      // Subscribe to maintenance updates
      const unsubscribeMaintenance = subscribeToMaintenance(
        plantId as string,
        areaId as string,
        equipmentId as string,
        (maintenances) => {
          setMaintenanceList(maintenances);
        }
      );

      return () => {
        unsubscribeEquipment();
        unsubscribeMaintenance();
      };
    }
  }, [plantId, areaId, equipmentId]);

  return (
    <>
      <Stack.Screen options={{
        title: `Manutenção`,
        headerTintColor: Colors[colorScheme ?? 'light'].headerTint,
        headerStyle: {
          backgroundColor: colorScheme === 'dark'
            ? '#111'
            : Colors[colorScheme ?? 'light'].tint,
        }
      }} />
      <View style={{ flex: 1 }}>
        <ParallaxScrollView
          contentStyle={[styles.content, { paddingBottom: 96 }]}
          // themedView={{ lightColor: '#f2f2f2', darkColor: '#000' }}
          headerImage={
            <Image
              source={require('@/assets/images/motor-parallax.png')}
              style={styles.headerImage}
              accessibilityLabel="Motor Parallax"
            />
          }
          headerBackgroundColor={{ light: Colors.light.headerBackground, dark: Colors.dark.headerBackgroundDark }}
        >
          <ThemedText type="title">{equipment?.name}</ThemedText>
          <ThemedText>{String(equipment?.description)}</ThemedText>
          
          {/* Property Badges */}
          <EquipamentBadges equipment={equipment ?? {}} />

          {/* Maintenance History Drawer */}
          <MaintenanceHistoryDrawer maintenanceList={maintenanceList} />
        </ParallaxScrollView>
        {/* Fixed Maintenance Action Button */}
        <SafeAreaView
          edges={['bottom']}
          style={[styles.fixedButtonContainer, { backgroundColor: screenBackgroundColor }]}
        >
          <TouchableOpacity 
            style={[
              styles.maintenanceButton,
              { backgroundColor: maintenanceButtonColor },
              equipment?.in_maintenance && { backgroundColor: maintenanceActiveColor }
            ]}
            onPress={async () => {
              if (!equipment) return;
              
              if (!equipment.in_maintenance) {
                // Start maintenance
                try {
                  await patchEquipment(String(plantId), String(areaId), String(equipmentId), { in_maintenance: true });
                  
                  // Navigate to control page
                  router.push({
                    pathname: '/maintenance/control/[equipmentId]' as any,
                    params: { plantId, areaId, equipmentId } as any,
                  });
                } catch (error) {
                  console.error('Error starting maintenance:', error);
                }
              } else {
                // Continue maintenance - navigate to control page
                router.push({
                  pathname: '/maintenance/control/[equipmentId]' as any,
                  params: { plantId, areaId, equipmentId } as any,
                });
              }
            }}
          >
            <ThemedText style={[styles.maintenanceButtonText, { color: buttonTextColor }]}>
              {equipment?.in_maintenance ? 'Continuar Manutenção' : 'Iniciar Manutenção'}
            </ThemedText>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  maintenanceButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  maintenanceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    // backgroundColor is set dynamically for theme
    // For iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // For Android elevation
    elevation: 8,
  },
}); 