// CheckoutScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet, Animated, Alert } from 'react-native';
import { Text, Card, Button, Divider, Surface, IconButton, useTheme, Snackbar } from 'react-native-paper';
import { syncServerCart, checkout as apiCheckout } from '../services/sales.api';
import { useCart } from '../contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { debugAuth } from '../services/http'; // opcional

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // ✅ Snackbar de éxito
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const n = (x: any, d = 0) => { const v = Number(x); return Number.isFinite(v) ? v : d; };

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start(); }, []);

  const onConfirm = async () => {
    if (items.length === 0) return;

    try {
      setLoading(true);

      // (Opcional) comprueba auth/usuario
      try {
        const me = await debugAuth?.();
        if (me) console.log('[AUTH][MOBILE]', me);
      } catch {
        console.warn('[AUTH] /auth/me falló — verifica token/cookies/baseURL');
      }

      // 1) sincroniza carrito en server (ADD/SET/REMOVE)
      const local = items.map(i => ({ productId: i.product.id, quantity: i.quantity }));
      console.log('[SYNC][LOCAL] ->', local);

      const server = await syncServerCart(local, 12);
      console.log('[SYNC][SERVER AFTER] ->', server);

      if (!server?.items?.length) {
        Alert.alert(
          'Aviso',
          'El servidor no recibió items del carrito.\n\nRevisa:\n• ¿Token guardado y válido?\n• ¿API_BASE_URL (10.0.2.2 vs localhost)?\n• ¿productId numérico (>0)?'
        );
        return;
      }

      // 2) checkout (método simple tipo web)
      const receipt = await apiCheckout({ paymentMethodCode: 'CASH' });

      // ✅ Mostrar mensaje de éxito antes de navegar
      setSnackMsg(`¡Compra realizada con éxito! Pedido #${receipt?.saleId ?? ''}`);
      setSnackVisible(true);

      // Espera breve para que se vea el mensaje y luego limpia/navega
      setTimeout(() => {
        clear();
        navigation?.navigate('Success', { receipt });
      }, 900);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'No se pudo procesar la compra';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const price = n(item?.product?.price, 0);
    const qty   = Math.max(1, n(item?.quantity, 1));
    const line  = price * qty;

    return (
      <Card style={styles.itemCard} mode="elevated">
        <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: '700' }}>{item?.product?.name ?? 'Producto'}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Q {price.toFixed(2)} c/u</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="bodyMedium" style={{ fontWeight: '700' }}>x{qty}</Text>
            <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '800' }}>Q {line.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <IconButton icon={() => <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />} onPress={() => navigation?.goBack()} />
        <Text variant="titleLarge" style={{ fontWeight: '800' }}>Resumen de Compra</Text>
        <View style={{ width: 48 }} />
      </Surface>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="displaySmall">🛒</Text>
          <Text variant="titleLarge" style={{ marginTop: 12, fontWeight: '700' }}>Tu carrito está vacío</Text>
          <Button mode="contained" onPress={() => navigation?.goBack()} style={{ marginTop: 12 }} buttonColor={theme.colors.primary} textColor="#fff">
            Ver productos
          </Button>
        </View>
      ) : (
        <>
          <Animated.View style={{ flex: 1, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
            <FlatList
              data={items}
              keyExtractor={(i) => String(i?.product?.id ?? Math.random())}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16, paddingBottom: 180 }}
              ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>

          <Surface style={styles.summary} elevation={8}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Total a pagar</Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900' }}>Q {n(total, 0).toFixed(2)}</Text>
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

            <Text style={{ textAlign: 'center', marginTop: 10, color: theme.colors.onSurfaceVariant, fontSize: 12 }}>🛡️ Pago 100% seguro</Text>
          </Surface>
        </>
      )}

      {/* ✅ Snackbar de éxito */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={1500}
        style={{ marginHorizontal: 12, marginBottom: 90, borderRadius: 12 }}
      >
        {snackMsg || '¡Compra realizada con éxito!'}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  header: {
    margin: 12, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff',
  },
  itemCard: { borderRadius: 12, paddingHorizontal: 8 },
  summary: { position: 'absolute', left: 12, right: 12, bottom: 18, borderRadius: 16, padding: 18, backgroundColor: '#fff' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
