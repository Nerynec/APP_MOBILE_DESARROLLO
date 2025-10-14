import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

// 🎨 Tema Material 3 con paleta personalizada
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0b5ed7',      // Azul principal
    secondary: '#6ad0ff',    // Celeste acento
    error: '#e11d48',        // Rojo
    success: '#16a34a',      // Verde
    warning: '#f59e0b',      // Amarillo
    accent: '#fb923c',       // Anaranjado
    background: '#f3f7fb',   // Fondo suave
    surface: '#ffffff',
    onPrimary: '#ffffff',
  },
  icon: (props: any) => <MaterialCommunityIcons {...props} />,
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
