import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddSector() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela para adicionar setor</Text>
      {/* Formulário para adicionar setor */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});
