import React, { useRef, useEffect } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Animated, View, Alert } from 'react-native';
import { Text, Surface, useTheme, IconButton, Badge, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProductsScreen({ navigation }: any) {
  const { add, items, clear } = useCart();
  const { logout } = useAuth();
  const theme = useTheme();

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClearCart = () => {
    if (!cartItemsCount) return;
    Alert.alert('Vaciar carrito', '¿Deseas eliminar todos los productos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: clear },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Encabezado personalizado */}
      <Surface elevation={3} style={styles.header}>
        <View>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Bienvenido
          </Text>
          <Text variant="headlineMedium" style={{ fontWeight: '800', color: theme.colors.primary }}>
            Nuestros Productos
          </Text>
        </View>

        <View style={styles.actions}>
          {/* Botón Carrito */}
          <View>
            <IconButton
              icon={() => <Ionicons name="cart" size={22} color="#fff" />}
              style={{ backgroundColor: theme.colors.primary }}
              onPress={() => navigation.navigate('Cart')}
            />
            {cartItemsCount > 0 && (
              <Badge
                size={18}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: theme.colors.error,
                  color: '#fff',
                }}
              >
                {cartItemsCount}
              </Badge>
            )}
          </View>

          {/* Botón Vaciar Carrito */}
          {cartItemsCount > 0 && (
            <IconButton
              icon={() => <Ionicons name="trash-outline" size={22} color="#fff" />}
              style={{ backgroundColor: theme.colors.error }}
              onPress={handleClearCart}
            />
          )}

          {/* Botón Logout */}
          <IconButton
            icon={() => <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />}
            onPress={logout}
            style={styles.logoutBtn}
            mode="contained-tonal"
          />
        </View>
      </Surface>

      {/* Lista de productos animada */}
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <FlatList
          data={PRODUCTS}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ProductCard product={item} onAdd={add} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Botón flotante de carrito */}
      {cartItemsCount > 0 && (
        <FAB
          icon="cart-check"
          label={`Ver carrito (${cartItemsCount})`}
          style={[styles.fab, { backgroundColor: theme.colors.success }]}
          color="#fff"
          onPress={() => navigation.navigate('Cart')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    elevation: 6,
  },
  logoutBtn: {
    backgroundColor: '#fff',
  },
});
