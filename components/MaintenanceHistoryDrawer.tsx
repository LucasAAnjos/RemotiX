import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View } from 'react-native';
import type { Maintenance } from '../.expo/types/Docs';
import { Collapsible } from './Collapsible';
import { ThemedText } from './ThemedText';

interface MaintenanceHistoryDrawerProps {
  maintenanceList: Maintenance[];
}

export function MaintenanceHistoryDrawer({ maintenanceList }: MaintenanceHistoryDrawerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Collapsible title="Histórico de Manutenção">
      {maintenanceList.length === 0 ? (
        <ThemedText style={styles.emptyText}>Nenhum registro encontrado.</ThemedText>
      ) : (
        <View>
          {maintenanceList.map((item, index) => (
            <View key={index} style={styles.maintenanceItem}>
              <ThemedText style={styles.maintenanceDescription}>
                {item.description.trim()}
              </ThemedText>
              <View style={styles.badgeContainer}>
                <View style={[styles.dateBadge, { backgroundColor: colors.tint }]}>
                  <ThemedText style={[styles.dateText, { color: colors.background }]}>
                    {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
                  </ThemedText>
                </View>
                <View style={[styles.userBadge, { backgroundColor: colors.inputBackground }]}>
                  <ThemedText style={[styles.userText, { color: colors.tint }]}>@{item.user}</ThemedText>
                </View>
              </View>
              <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            </View>
          ))}
        </View>
      )}
    </Collapsible>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    opacity: 0.6,
  },
  maintenanceItem: {
    marginBottom: 0,
  },
  maintenanceDescription: {
    fontSize: 16,
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  dateText: {
    fontSize: 12,
  },
  userBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  userText: {
    fontSize: 12,
  },
  separator: {
    height: 1,
    marginBottom: 10,
    marginTop: 2,
    opacity: 0.7,
  },
}); 