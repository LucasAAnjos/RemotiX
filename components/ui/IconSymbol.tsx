// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = 'house.fill' | 'gear.badge' | 'person.crop.circle' | 'chevron.right' | 'wrench' | 'double.arrow' | 'plus' | 'delete' | 'edit' | 'camera' | 'arrow.clockwise' | 'checkmark';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<IconSymbolName, (
  'factory' |
  'conveyor-belt' |
  'person' |
  'chevron-right' |
  'construction' |
  'double-arrow' |
  'add' |
  'delete' |
  'edit' |
  'camera-alt' |
  'refresh' |
  'check'
)> = {
  'house.fill': 'factory',
  'gear.badge': 'conveyor-belt',
  'person.crop.circle': 'person',
  'chevron.right': 'chevron-right',
  'wrench': 'construction',
  'double.arrow': 'double-arrow',
  'plus': 'add',
  'delete': 'delete',
  'edit': 'edit',
  'camera': 'camera-alt',
  'arrow.clockwise': 'refresh',
  'checkmark': 'check',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
