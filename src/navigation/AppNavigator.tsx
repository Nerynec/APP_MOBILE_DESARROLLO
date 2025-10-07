import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { TouchableOpacity, Text, View, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { CartProvider, useCart } from '../contexts/CartContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const Stack = createStackNavigator();

// Botón de carrito en el header con contador y opción de vaciar
const CartHeaderButton = ({ navigation }: any) => {
  const { itemCount, clear } = useCart();

  const handleClear = () => {
    if (!itemCount) return;
    Alert.alert('Vaciar carrito', '¿Deseas eliminar todos los productos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: clear },
    ]);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Cart')}
        style={styles.cartButton}
      >
        <Ionicons name="cart-outline" size={24} color="#fff" />
        {itemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {itemCount > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.cartClearButton}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Botón de logout
const LogoutButton = ({ navigation, logout }: any) => (
  <TouchableOpacity
    onPress={() => {
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }}
    style={styles.logoutButton}
  >
    <Ionicons name="log-out-outline" size={22} color="#fff" />
  </TouchableOpacity>
);

export default function AppNavigator() {
  const { user, logout } = useAuth();

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
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={commonScreenOptions}>
          {user ? (
            <>
              <Stack.Screen
                name="Products"
                component={ProductsScreen}
                options={({ navigation }) => ({
                  title: 'Tornillo Feliz 🔩',
                  headerLeft: () => (
                    <View style={{ marginLeft: 15 }}>
                      <Text style={styles.greeting}>
                        Hola, {user.username || 'Usuario'}
                      </Text>
                    </View>
                  ),
                  headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CartHeaderButton navigation={navigation} />
                      <LogoutButton navigation={navigation} logout={logout} />
                    </View>
                  ),
                })}
              />
              <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{
                  title: '🛒 Carrito',
                  headerBackTitle: 'Productos',
                }}
              />
              <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{
                  title: '💳 Finalizar Compra',
                  headerBackTitle: 'Carrito',
                  gestureEnabled: false,
                }}
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
                options={{
                  title: 'Crear Cuenta',
                  headerBackground: () => (
                    <LinearGradient
                      colors={['#2ecc71', '#27ae60']}
                      style={StyleSheet.absoluteFill}
                    />
                  ),
                  headerTintColor: '#fff',
                  headerBackTitle: 'Volver',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
  },
  cartButton: {
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  cartClearButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
  },
  cartBadge: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  greeting: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
