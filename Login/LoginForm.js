import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../ValidaçõesTeste/AuthContext';
import { validateInput } from '../ValidaçõesTeste/ValidateCaracter';
import { sanitizeInput } from '../ValidaçõesTeste/ValidateCaracter';

const LoginForm = () => {
  const navigation = useNavigation();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Áreas' }],
      });
    }
  }, [isAuthenticated]);

const validateForm = () => {
  const errors = {};

  if (!username.trim()) {
    errors.username = 'Usuário é obrigatório';
  } else if (!validateInput.username(username)) {
    errors.username = 'Usuário deve ter pelo menos 3 caracteres e conter apenas letras, números e _';
  }

  if (!password.trim()) {
    errors.password = 'Senha é obrigatória';
  } else if (!validateInput.password(password)) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleLogin = async () => {
  setError('');
  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const sanitizedUsername = sanitizeInput(username);
    const success = await login(sanitizedUsername, password);

    if (!success) {
      setError('Usuário ou senha inválidos');
    }
  } catch (err) {
    setError('Erro interno do servidor. Tente novamente.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>RemotiX Service</Text>
        <Text style={styles.subtitle}>Sistema de Gestão de Manutenções</Text>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={[styles.input, validationErrors.username && styles.inputError]}
          placeholder="Usuário"
          value={username}
          onChangeText={setUsername}
          editable={!isLoading}
          maxLength={50}
          autoCapitalize="none"
        />
        {validationErrors.username && (
          <Text style={styles.errorText}>{validationErrors.username}</Text>
        )}

        <TextInput
          style={[styles.input, validationErrors.password && styles.inputError]}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          maxLength={100}
          autoCapitalize="none"
        />
        {validationErrors.password && (
          <Text style={styles.errorText}>{validationErrors.password}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F54',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F54',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#001F54',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default LoginForm;
