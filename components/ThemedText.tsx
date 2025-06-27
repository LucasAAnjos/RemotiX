import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, Text, TextProps } from 'react-native';

export function ThemedText(props: TextProps & { type?: 'default' | 'title' | 'subtitle' }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Text
      {...props}
      style={[
        styles.text,
        {
          color: colors.text,
        },
        props.type === 'title' && styles.title,
        props.type === 'subtitle' && styles.subtitle,
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
