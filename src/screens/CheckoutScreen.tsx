import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet, Animated } from 'react-native';
import { Text, Card, Button, Divider, Surface, IconButton, useTheme } from 'react-native-paper';
import { createOrGetCart, setItem, checkout as apiCheckout } from '../services/sales.api';
import { Alert } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { placeOrderMobile, CheckoutPayload } from '../services/sales.api';

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // simple fade/slide in
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, []);

const onConfirm = async () => {
  if (items.length === 0) return;

  try {
    setLoading(true);

    const subtotal = items.reduce(
      (acc: number, i: any) => acc + Number(i.product.price ?? 0) * Number(i.quantity ?? 0),
      0
    );

    const payload: CheckoutPayload = {
      items: items.map((i: any) => ({
        productId: i.product.id,
        quantity: Number(i.quantity),
        unitPrice: Number(i.product.price ?? 0),
      })),
      summary: {
        subtotal,
        tax: 0,        // si calculas IVA en la app, ponlo aquí
        shipping: 0,   // si tienes envío, ponlo aquí
        total: subtotal, // se calcula para UI, pero el service lo quita antes del checkout
      },
      customer: { name: 'Consumidor Final', phone: '0000-0000' }, // reemplaza con tu formulario si ya lo tienes
      delivery: { method: 'pickup' },  // o 'delivery' con address en customer
      payment: { method: 'cash' },     // 'card' | 'transfer' (+ reference)
    };

    const receipt = await placeOrderMobile(payload);
    clear();
    navigation?.navigate('Success', { receipt });
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'No se pudo procesar la compra';
    Alert.alert('Error', msg);
  } finally {
    setLoading(false);
  }
};


  const renderItem = ({ item }: any) => (
    <Card style={styles.itemCard} mode="elevated">
      <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: '700' }}>
            {item.product.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Q {item.product.price.toFixed(2)} c/u
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
            x{item.quantity}
          </Text>
          <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '800' }}>
            Q {(item.product.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <IconButton icon={() => <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />} onPress={() => navigation?.goBack()} />
        <Text variant="titleLarge" style={{ fontWeight: '800' }}>
          Resumen de Compra
        </Text>
        <View style={{ width: 48 }} />
      </Surface>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="displaySmall">🛒</Text>
          <Text variant="titleLarge" style={{ marginTop: 12, fontWeight: '700' }}>
            Tu carrito está vacío
          </Text>
          <Button mode="contained" onPress={() => navigation?.goBack()} style={{ marginTop: 12 }} buttonColor={theme.colors.primary} textColor="#fff">
            Ver productos
          </Button>
        </View>
      ) : (
        <>
          <Animated.View style={{ flex: 1, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
            <FlatList
              data={items}
              keyExtractor={(i) => i.product.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16, paddingBottom: 180 }}
              ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>

          <Surface style={styles.summary} elevation={8}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Subtotal
              </Text>
              <Text variant="bodyMedium">Q {total.toFixed(2)}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Envío
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.success, fontWeight: '700' }}>
                Gratis
              </Text>
            </View>

            <Divider style={{ marginVertical: 8 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="titleMedium" style={{ fontWeight: '800' }}>
                Total a pagar
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900' }}>
                Q {total.toFixed(2)}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={onConfirm}
              loading={loading}
              disabled={loading}
              buttonColor={theme.colors.success}
              textColor="#fff"
              style={{ borderRadius: 12, paddingVertical: 10 }}
              icon={() => <Ionicons name="lock-closed" size={18} color="#fff" />}
            >
              {loading ? 'Procesando...' : 'Confirmar compra'}
            </Button>

            <Text style={{ textAlign: 'center', marginTop: 10, color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
              🛡️ Pago 100% seguro
            </Text>
          </Surface>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  header: {
    margin: 12,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCard: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  summary: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#fff',
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
