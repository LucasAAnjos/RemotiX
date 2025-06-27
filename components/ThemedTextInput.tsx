import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export function ThemedTextInput(props: TextInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          color: colors.text,
          backgroundColor: colors.inputBackground,
          borderColor: colors.inputBorder,
        },
        props.style,
      ]}
      placeholderTextColor={colors.icon}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
}); 