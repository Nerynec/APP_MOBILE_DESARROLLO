import React from 'react';
import { SafeAreaView, View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, clear } = useCart();

  const onConfirm = () => {
    Alert.alert(
      '¡Compra Exitosa! 🎉',
      `Tu pedido por Q ${total.toFixed(2)} ha sido procesado correctamente.\n\n¡Gracias por tu compra!`,
      [
        {
          text: 'Continuar Comprando',
          onPress: () => {
            clear();
            navigation.navigate('Products');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#34d399', '#059669']} style={styles.header}>
        <Text style={styles.headerTitle}>💳 Checkout</Text>
        <Text style={styles.headerSubtitle}>Revisa tu pedido antes de confirmar</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Resumen del Pedido */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Resumen del Pedido</Text>
          {items.map((item, index) => (
            <View
              key={item.product.id}
              style={[
                styles.itemRow,
                index < items.length - 1 && styles.itemDivider
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQty}>
                  {item.quantity} × Q {item.product.price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>Q {(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Desglose de costos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Desglose</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Subtotal</Text>
            <Text style={styles.summaryValue}>Q {total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Envío</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>Gratis 🎁</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalValue}>Q {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Pago Seguro */}
        <LinearGradient colors={['#e0f2fe', '#c7d2fe']} style={styles.secureCard}>
          <Text style={styles.secureTitle}>🔒 Pago Seguro</Text>
          <Text style={styles.secureSubtitle}>
            Tu información está protegida con encriptación de nivel bancario
          </Text>
        </LinearGradient>

        {/* Método de Pago */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Método de Pago</Text>
          <Pressable style={styles.paymentMethod}>
            <View style={styles.paymentIcon}>
              <Text style={{ fontSize: 22 }}>💳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Tarjeta de Crédito</Text>
              <Text style={styles.paymentSubtitle}>**** **** **** 1234</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="green" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Botones Fijos */}
      <View style={styles.bottom}>
        <LinearGradient colors={['#34d399', '#059669']} style={styles.confirmBtn}>
          <Pressable onPress={onConfirm} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.confirmText}>✨ Confirmar Compra - Q {total.toFixed(2)}</Text>
          </Pressable>
        </LinearGradient>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Volver al Carrito</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: '#d1fae5', fontSize: 14, marginTop: 4 },

  scroll: { flex: 1, marginTop: 16, paddingHorizontal: 16 },

  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemQty: { fontSize: 13, color: '#6b7280' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryText: { color: '#6b7280', fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#2563eb' },

  secureCard: { borderRadius: 20, padding: 16, marginBottom: 16 },
  secureTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  secureSubtitle: { fontSize: 13, color: '#6b7280' },

  paymentMethod: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#eef2ff', borderRadius: 20 },
  paymentIcon: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginRight: 12 },
  paymentTitle: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 15 },
  paymentSubtitle: { color: '#c7d2fe', fontSize: 12 },

  bottom: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  confirmBtn: { borderRadius: 24, paddingVertical: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { alignItems: 'center', paddingVertical: 12 },
  backText: { color: '#6b7280', fontWeight: '600' },
});
