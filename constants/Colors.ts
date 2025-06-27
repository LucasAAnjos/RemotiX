/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f5f5f5',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // Status colors
    maintenance: '#ff6b6b',
    active: '#51cf66',
    inactive: '#888',
    warning: '#ffcc80',
    error: '#ff6b6b',
    success: '#51cf66',
    
    // UI element colors
    cardBackground: '#ffffff',
    cardBorder: '#e1e1e1',
    inputBackground: '#f0f0f0',
    inputBorder: '#e0e0e0',
    disabled: '#ccc',
    separator: '#d0d7de',
    
    // Badge colors
    maintenanceBadgeBg: '#ffe3e3',
    maintenanceBadgeBorder: '#c92a2a',
    activeBadgeBg: '#d3f9df',
    activeBadgeBorder: '#186a3b',
    clearFilterBg: '#f1f3f5',
    clearFilterBorder: '#adb5bd',
    clearFilterText: '#868e96',
    
    // Equipment badge colors
    modelBadgeBg: '#f3e5f5',
    modelBadgeText: '#7b1fa2',
    driveBadgeBg: '#e8f5e8',
    driveBadgeText: '#388e3c',
    inputBadgeBg: '#fff3e0',
    inputBadgeText: '#f57c00',
    outputBadgeBg: '#fce4ec',
    outputBadgeText: '#c2185b',
    ipBadgeBg: '#f1f8e9',
    ipBadgeText: '#689f38',
    
    // Modal colors
    modalBackground: '#ffffff',
    modalBorder: '#ddd',
    modalInputBg: '#f0f0f0',
    
    // Warning colors
    warningBg: '#fff3cd',
    warningBorder: '#ffeaa7',
    warningText: '#856404',
    
    // Power control colors
    powerButton: '#0077a6',
    powerButtonActive: '#ff0000',
    alarmBadgeOff: '#f0f0f0',
    alarmBadgeOn: '#51cf66',
    alarmBadgeBorder: '#ddd',
    alarmBadgeOnBorder: '#40c057',
    alarmIcon: '#666',
    
    // Edit mode colors
    editModeBg: '#e3f2fd',
    editFabActive: '#007AFF',
    saveFab: '#51cf66',
    
    // Header colors
    headerBackground: '#0077a6',
    headerBackgroundDark: '#00334d',
    
    // Shadow colors
    shadow: '#000',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    
    // Header colors
    headerTint: '#ffffff',
    
    // Icon colors
    iconDefault: '#666',
    
    // Background colors
    blackBackground: '#000',
    
    // Dot indicator colors
    dotInactive: '#888',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0f0f0f',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    
    // Status colors
    maintenance: '#ff8a8a',
    active: '#69db7c',
    inactive: '#aaa',
    warning: '#ffcc80',
    error: '#ff8a8a',
    success: '#69db7c',
    
    // UI element colors
    cardBackground: '#1c1c1e',
    cardBorder: '#38383a',
    inputBackground: '#2a2a2a',
    inputBorder: '#404040',
    disabled: '#666',
    separator: '#404040',
    
    // Badge colors
    maintenanceBadgeBg: '#4a1b1b',
    maintenanceBadgeBorder: '#ff6b6b',
    activeBadgeBg: '#1b4a1b',
    activeBadgeBorder: '#51cf66',
    clearFilterBg: '#2a2a2a',
    clearFilterBorder: '#666',
    clearFilterText: '#aaa',
    
    // Equipment badge colors
    modelBadgeBg: '#4a1b4a',
    modelBadgeText: '#e1bee7',
    driveBadgeBg: '#1b4a1b',
    driveBadgeText: '#c8e6c9',
    inputBadgeBg: '#4a3a1b',
    inputBadgeText: '#ffcc80',
    outputBadgeBg: '#4a1b2a',
    outputBadgeText: '#f8bbd9',
    ipBadgeBg: '#2a4a1b',
    ipBadgeText: '#c5e1a5',
    
    // Modal colors
    modalBackground: '#1c1c1e',
    modalBorder: '#404040',
    modalInputBg: '#2a2a2a',
    
    // Warning colors
    warningBg: '#4a3a1b',
    warningBorder: '#ffcc80',
    warningText: '#ffcc80',
    
    // Power control colors
    powerButton: '#4dabf7',
    powerButtonActive: '#c92a2a',
    alarmBadgeOff: '#2a2a2a',
    alarmBadgeOn: '#69db7c',
    alarmBadgeBorder: '#404040',
    alarmBadgeOnBorder: '#51cf66',
    alarmIcon: '#aaa',
    
    // Edit mode colors
    editModeBg: '#1a3a4a',
    editFabActive: '#4dabf7',
    saveFab: '#69db7c',
    
    // Header colors
    headerBackground: '#4dabf7',
    headerBackgroundDark: '#1a3a4a',
    
    // Shadow colors
    shadow: '#000',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    
    // Header colors
    headerTint: '#ffffff',
    
    // Icon colors
    iconDefault: '#aaa',
    
    // Background colors
    blackBackground: '#000',
    
    // Dot indicator colors
    dotInactive: '#aaa',
  },
};
