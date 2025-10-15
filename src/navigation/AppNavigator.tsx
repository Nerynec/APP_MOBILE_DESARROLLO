import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AppNavigatorHeader from './AppNavigatorHeader';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ComprasScreen from '../screens/ComprasScreen';
import ReporteriaScreen from '../screens/ReporteriaScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();
  const cart = useCart();

  const commonScreenOptions = {
    headerBackground: () => (
      <LinearGradient
        colors={['#3498db', '#2980b9']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    ),
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: '700',
      fontSize: 20,
      letterSpacing: 0.5,
    },
    headerShadowVisible: false,
    ...TransitionPresets.SlideFromRightIOS,
  };

  return (
    <Stack.Navigator screenOptions={commonScreenOptions}>
      {user ? (
        <>
          <Stack.Screen
            name="Products"
            component={ProductsScreen}
            options={({ navigation }) => ({
              title: '🛍️ Productos',
              headerRight: () => (
                <AppNavigatorHeader navigation={navigation} cart={cart} />
              ),
            })}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={({ navigation }) => ({
              title: '🛒 Carrito',
              headerRight: () => (
                <AppNavigatorHeader navigation={navigation} cart={cart} />
              ),
            })}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              title: '💳 Finalizar Compra',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: '📊 Dashboard' }}
          />
          <Stack.Screen
            name="Compras"
            component={ComprasScreen}
            options={{ title: '🧾 Compras' }}
          />
          <Stack.Screen
            name="Reporteria"
            component={ReporteriaScreen}
            options={{ title: '📈 Reportería' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
              animationTypeForReplace: user ? 'pop' : 'push',
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
