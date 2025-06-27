import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useAuth } from '../../lib/auth';
import { getUserData } from '../../lib/db';

export default function UserTab() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<{ name?: string; email?: string; plantId?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  // Theme-aware colors
  const cardBackgroundColor = useThemeColor({ light: Colors.light.cardBackground, dark: Colors.dark.cardBackground }, 'background');
  const cardBorderColor = useThemeColor({ light: Colors.light.cardBorder, dark: Colors.dark.cardBorder }, 'icon');
  const borderColor = useThemeColor({ light: '#f0f0f0', dark: '#404040' }, 'icon');
  const logoutButtonColor = useThemeColor({ light: '#ff4757', dark: '#ff6b6b' }, 'text');
  const logoutButtonTextColor = 'white';
  const pageBgColor = useThemeColor({}, 'background');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Saída',
      'Tem certeza que deseja sair da aplicação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBgColor }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Perfil do Usuário</ThemedText>
          <ThemedText style={styles.subtitle}>Informações da conta</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informações Pessoais</ThemedText>
          <ThemedView style={[styles.card, { 
            backgroundColor: cardBackgroundColor,
            borderColor: cardBorderColor
          }]}>
            {userData?.name && (
              <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
                <ThemedText style={styles.label}>Nome</ThemedText>
                <ThemedText style={styles.value}>{userData.name}</ThemedText>
              </View>
            )}
            <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedText style={styles.value}>{user.email}</ThemedText>
            </View>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informações do Sistema</ThemedText>
          <ThemedView style={[styles.card, { 
            backgroundColor: cardBackgroundColor,
            borderColor: cardBorderColor
          }]}>
            <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
              <ThemedText style={styles.label}>ID do Usuário</ThemedText>
              <ThemedText style={styles.value}>{user.uid}</ThemedText>
            </View>
            {userData?.plantId && (
              <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
                <ThemedText style={styles.label}>ID da Planta</ThemedText>
                <ThemedText style={styles.value}>{userData.plantId}</ThemedText>
              </View>
            )}
            {userData?.role && (
              <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
                <ThemedText style={styles.label}>Cargo</ThemedText>
                <ThemedText style={styles.value}>{userData.role}</ThemedText>
              </View>
            )}
          </ThemedView>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { 
              backgroundColor: logoutButtonColor,
              borderColor: cardBorderColor
            }]} 
            onPress={handleLogout}
          >
            <ThemedText style={[styles.logoutButtonText, { color: logoutButtonTextColor }]}>Sair da Conta</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
    flex: 1,
  },
  value: {
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 