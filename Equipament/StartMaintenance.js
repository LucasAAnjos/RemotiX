import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RotateCcw, CheckCircle2, Settings } from 'lucide-react-native';
import { useAuth } from '../ValidaçõesTeste/AuthContext';

function addMaintenanceRecord(record) {
  console.log('✅ Manutenção registrada:', record);
}

export default function StartMaintenance() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [isOn, setIsOn] = useState(false); // false = 0, true = 1
  const [mode, setMode] = useState('Manual');
  const [alarms, setAlarms] = useState(['Sobreaquecimento']);
  const [warnings] = useState(['Nível de óleo baixo']);

  const handleToggle = (value) => {
    setIsOn(value);
  };

  const handleModeToggle = () => {
    setMode(mode === 'Manual' ? 'Automático' : 'Manual');
  };

  const handleReset = () => {
    setAlarms([]);
    Alert.alert('Resetado', 'Sistema e alarmes resetados com sucesso.');
  };

  const handleFinish = () => {
    const now = new Date();
    addMaintenanceRecord({
      ticketNumber: `#MT-${String(Date.now()).slice(-3)}`,
      description: 'Manutenção finalizada',
      responsible: user.username,
      function: user.role,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manutenção Iniciada</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Controle do Motor</Text>

        {mode === 'Manual' ? (
          <View style={styles.switchContainer}>
            <Switch
              value={isOn}
              onValueChange={handleToggle}
              thumbColor={isOn ? '#00C853' : '#D32F2F'}
              trackColor={{ false: '#FFCDD2', true: '#A5D6A7' }}
              ios_backgroundColor="#FFCDD2"
              style={styles.switchStyle}
            />
            <Text style={[styles.switchLabel, { color: isOn ? '#00C853' : '#D32F2F' }]}>
              Motor {isOn ? 'Ligado (1)' : 'Desligado (0)'}
            </Text>
          </View>
        ) : (
          <Text style={styles.automaticText}>Modo Automático ativado - controle manual desativado</Text>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2962FF', marginTop: 12, marginBottom: 8 }]}
          onPress={handleModeToggle}
        >
          <Settings size={18} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Modo: {mode}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <RotateCcw size={18} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Resetar Sistema</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardIndustrial}>
        <Text style={styles.cardTitleIndustrial}>🔥 Alarmes</Text>
        {alarms.length > 0 ? (
          alarms.map((a, index) => (
            <Text key={index} style={styles.alertTextIndustrial}>
              ⚠️ {a}
            </Text>
          ))
        ) : (
          <Text style={styles.noAlertText}>Nenhum alarme ativo</Text>
        )}
      </View>

      <View style={styles.cardIndustrialWarning}>
        <Text style={styles.cardTitleIndustrial}>⚠️ Avisos</Text>
        {warnings.length > 0 ? (
          warnings.map((w, index) => (
            <Text key={index} style={styles.warningTextIndustrial}>
              ⚠️ {w}
            </Text>
          ))
        ) : (
          <Text style={styles.noAlertText}>Nenhum aviso ativo</Text>
        )}
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <CheckCircle2 size={18} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Finalizar Manutenção</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F0F4F8', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#001F54', marginBottom: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#001F54', marginBottom: 12 },

  // Estilo industrial para cards
  cardIndustrial: {
    backgroundColor: '#1B1B1B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  cardIndustrialWarning: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 6,
    shadowColor: '#FFB300',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitleIndustrial: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF3B30',
    marginBottom: 14,
    textShadowColor: '#FF0000',
    textShadowRadius: 5,
  },

  alertTextIndustrial: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  warningTextIndustrial: {
    color: '#FFB300',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  noAlertText: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: 16,
  },

  // Switch maior e destacado
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchStyle: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    ...Platform.select({
      ios: {
        marginVertical: 12,
      },
      android: {
        marginVertical: 0,
      },
    }),
  },
  switchLabel: {
    marginLeft: 16,
    fontWeight: 'bold',
    fontSize: 18,
  },

  automaticText: {
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 12,
    fontSize: 16,
  },

  button: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF6F00',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },

  finishButton: {
    backgroundColor: '#001F54',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
