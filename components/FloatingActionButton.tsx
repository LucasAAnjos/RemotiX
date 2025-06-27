import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type IconSymbolName = 'house.fill' | 'gear.badge' | 'person.crop.circle' | 'chevron.right' | 'wrench' | 'double.arrow' | 'plus' | 'delete' | 'edit' | 'camera' | 'arrow.clockwise' | 'checkmark';

interface FloatingActionButtonProps extends TouchableOpacityProps {
  iconName: IconSymbolName;
  size?: number;
}

export function FloatingActionButton({ 
  iconName, 
  size = 56, 
  style, 
  ...props 
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          backgroundColor: colors.tint,
          shadowColor: colors.shadow,
        },
        style,
      ]}
      {...props}
    >
      <IconSymbol name={iconName} size={size * 0.4} color={colors.background} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
}); 