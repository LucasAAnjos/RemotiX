import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface PropertyBadgesProps {
  equipment: {
    id?: string;
    model?: string;
    driveType?: string;
    inputSignal?: string;
    outputSignal?: string;
    ipAddress?: string;
  };
}

export function EquipamentBadges({ equipment }: PropertyBadgesProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {/* {equipment.id && (
        <View style={styles.idBadge}>
          <ThemedText style={styles.idText}>ID: {String(equipment.id)}</ThemedText>
        </View>
      )} */}
      {equipment.model && (
        <ThemedView style={[styles.badge, { backgroundColor: colors.modelBadgeBg }]}>
          <ThemedText style={[styles.badgeText, { color: colors.modelBadgeText }]}>Modelo: {String(equipment.model)}</ThemedText>
        </ThemedView>
      )}
      {equipment.driveType && (
        <ThemedView style={[styles.badge, { backgroundColor: colors.driveBadgeBg }]}>
          <ThemedText style={[styles.badgeText, { color: colors.driveBadgeText }]}>Drive: {String(equipment.driveType)}</ThemedText>
        </ThemedView>
      )}
      {equipment.inputSignal && (
        <ThemedView style={[styles.badge, { backgroundColor: colors.inputBadgeBg }]}>
          <ThemedText style={[styles.badgeText, { color: colors.inputBadgeText }]}>Entrada: {String(equipment.inputSignal)}</ThemedText>
        </ThemedView>
      )}
      {equipment.outputSignal && (
        <ThemedView style={[styles.badge, { backgroundColor: colors.outputBadgeBg }]}>
          <ThemedText style={[styles.badgeText, { color: colors.outputBadgeText }]}>Saída: {String(equipment.outputSignal)}</ThemedText>
        </ThemedView>
      )}
      {equipment.ipAddress && (
        <ThemedView style={[styles.badge, { backgroundColor: colors.ipBadgeBg }]}>
          <ThemedText style={[styles.badgeText, { color: colors.ipBadgeText }]}>IP: {String(equipment.ipAddress)}</ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 