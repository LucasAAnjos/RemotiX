import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../lib/auth';

export default function LoginScreen() {
  const { user, loading, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (user && !loading) {
      router.replace('/');
    }
  }, [user, loading]);

  const handleLogin = async () => {
    setFormLoading(true);
    setError('');
    const result = await login(email, password);
    setFormLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    setFormLoading(true);
    await logout();
    setFormLoading(false);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.splashText}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  if (user) {
    const username = user.email ? user.email.split('@')[0] : '';
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.splashText}>Bem-vindo, {user.email}!</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Quem é você?</ThemedText>
      <ThemedTextInput
        style={[styles.input, { borderColor: colors.inputBorder }]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ThemedTextInput
        style={[styles.input, { borderColor: colors.inputBorder }]}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <ThemedText style={[styles.error, { color: colors.error }]}>{error}</ThemedText> : null}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint }]} 
        onPress={handleLogin}
        disabled={formLoading}
      >
        <ThemedText style={[styles.buttonText, { color: colors.background }]}>{formLoading ? 'Entrando...' : 'Entrar'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    marginBottom: 8,
    textAlign: 'center',
  },
}); 