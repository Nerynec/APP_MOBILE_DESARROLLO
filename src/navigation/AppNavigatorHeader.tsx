import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppNavigatorHeader({ navigation, cart }: any) {
  const { itemCount, clear } = cart;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleClear = () => {
    if (!itemCount) return;
    Alert.alert('Vaciar carrito', '¿Deseas eliminar todos los productos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: clear },
    ]);
  };

  const navigateTo = (screen: string) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* 🔹 Botón menú */}
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
        <Ionicons name="menu-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 🔹 Botón carrito */}
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

      {/* 🔹 Menú modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={() => navigateTo('Dashboard')} style={styles.menuItem}>
              <Ionicons name="speedometer-outline" size={20} color="#2980b9" />
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateTo('Compras')} style={styles.menuItem}>
              <Ionicons name="receipt-outline" size={20} color="#2980b9" />
              <Text style={styles.menuText}>Compras</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateTo('Reporteria')} style={styles.menuItem}>
              <Ionicons name="bar-chart-outline" size={20} color="#2980b9" />
              <Text style={styles.menuText}>Reportería</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateTo('Usuarios')} style={styles.menuItem}>
              <Ionicons name="bar-chart-outline" size={20} color="#2980b9" />
              <Text style={styles.menuText}>Usuarios</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateTo('Administrar')} style={styles.menuItem}>
              <Ionicons name="bar-chart-outline" size={20} color="#2980b9" />
              <Text style={styles.menuText}>Administrar Productos</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginRight: 10,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 50,
    marginRight: 10,
    borderRadius: 12,
    paddingVertical: 10,
    width: 180,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
