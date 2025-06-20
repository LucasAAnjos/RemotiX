import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebaseConfig';
import { savePlantId } from '../src/storage/localStorage';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const LoginForm = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuário logado:", user.uid);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Áreas' }],
        });
      }
    });

    return unsubscribe;
  }, []);

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!isValidEmail(email)) {
      errors.email = 'Formato de e-mail inválido';
    }

    if (!password.trim()) {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
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
      await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const plantId = userDoc.exists() ? userDoc.data().plantID : null;
      await savePlantId(plantId);
     } catch (err) {
      console.error(err);
      let message = 'Erro ao fazer login. Verifique suas credenciais.';
      if (err.code === 'auth/user-not-found') message = 'Usuário não encontrado.';
      else if (err.code === 'auth/wrong-password') message = 'Senha incorreta.';
      else if (err.code === 'auth/invalid-email') message = 'Email inválido.';
      else if (err.code === 'auth/too-many-requests') message = 'Muitas tentativas. Tente novamente mais tarde.';

      setError(message);
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
          style={[styles.input, validationErrors.email && styles.inputError]}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {validationErrors.email && (
          <Text style={styles.errorText}>{validationErrors.email}</Text>
        )}

        <TextInput
          style={[styles.input, validationErrors.password && styles.inputError]}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
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
