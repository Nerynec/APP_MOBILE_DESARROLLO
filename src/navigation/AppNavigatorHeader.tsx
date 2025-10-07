import React from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppNavigatorHeader({ navigation, cart }: any) {
  const { itemCount, clear } = cart;

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
}

const styles = StyleSheet.create({
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
});
