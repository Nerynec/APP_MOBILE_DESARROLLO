// CheckoutScreen.tsx - Versión Moderna CORREGIDA
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet, Animated, Alert, Pressable } from 'react-native';
import { Text, Card, Button, Divider, Surface, IconButton, useTheme, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { syncServerCart, checkout as apiCheckout } from '../services/sales.api';
import { useCart } from '../contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { debugAuth } from '../services/http';

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const n = (x: any, d = 0) => { const v = Number(x); return Number.isFinite(v) ? v : d; };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    // Animación de pulso para el botón de pago
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const onConfirm = async () => {
    if (items.length === 0) return;

    try {
      setLoading(true);

      try {
        const me = await debugAuth?.();
        if (me) console.log('[AUTH][MOBILE]', me);
      } catch {
        console.warn('[AUTH] /auth/me falló – verifica token/cookies/baseURL');
      }

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

      const receipt = await apiCheckout({ paymentMethodCode: 'CASH' });

      setSnackMsg(`🎉 ¡Compra realizada con éxito! Pedido #${receipt?.saleId ?? ''}`);
      setSnackVisible(true);

      setTimeout(() => {
        clear();
        navigation?.navigate('Success', { receipt });
      }, 900);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'No se pudo procesar la compra';
      Alert.alert('❌ Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const price = n(item?.product?.price, 0);
    const qty = Math.max(1, n(item?.quantity, 1));
    const line = price * qty;

    return (
      <LinearGradient
        colors={['#ffffff', '#fef3ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.itemCard}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemLeft}>
            <View style={styles.productIconWrapper}>
              <LinearGradient
                colors={['#d946ef', '#c026d3']}
                style={styles.productIcon}
              >
                <Ionicons name="cube" size={20} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.itemInfo}>
              <Text variant="titleMedium" numberOfLines={2} style={styles.itemName}>
                {item?.product?.name ?? 'Producto'}
              </Text>
              <View style={styles.pricePerUnit}>
                <Text style={styles.pricePerUnitText}>Q {price.toFixed(2)}</Text>
                <Text style={styles.perUnitLabel}>c/u</Text>
              </View>
            </View>
          </View>
          <View style={styles.itemRight}>
            <View style={styles.qtyBadge}>
              <Ionicons name="close" size={14} color="#6b7280" />
              <Text style={styles.qtyBadgeText}>{qty}</Text>
            </View>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.lineTotalBadge}
            >
              <Text style={styles.lineTotalAmount}>Q {line.toFixed(2)}</Text>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        style={styles.backgroundGradient}
      >
        {/* Header Glassmorphic */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.headerGlass}
          >
            <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </LinearGradient>
            </Pressable>
            
            <View style={styles.headerCenter}>
              <Ionicons name="receipt" size={28} color="#10b981" />
              <Text style={styles.headerTitle}>Resumen</Text>
            </View>
            
            <View style={{ width: 44 }} />
          </LinearGradient>
        </Animated.View>

        {items.length === 0 ? (
          <Animated.View
            style={[
              styles.empty,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIcon}>
                <Ionicons name="cart-outline" size={80} color="#10b981" />
              </View>
              <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
              <Text style={styles.emptySubtitle}>
                Agrega productos para continuar con la compra
              </Text>
              <Pressable onPress={() => navigation?.goBack()} style={styles.backToShop}>
                <LinearGradient
                  colors={['#d946ef', '#c026d3']}
                  style={styles.backToShopGradient}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                  <Text style={styles.backToShopText}>Ver productos</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        ) : (
          <>
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
              <FlatList
                data={items}
                keyExtractor={(i) => String(i?.product?.id ?? Math.random())}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                showsVerticalScrollIndicator={false}
              />
            </Animated.View>

            {/* Footer de Pago */}
            <Animated.View
              style={[
                styles.summary,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
                style={styles.summaryGlass}
              >
                {/* Desglose visual */}
                <View style={styles.breakdown}>
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownIcon}>
                      <Ionicons name="cube-outline" size={20} color="#10b981" />
                    </View>
                    <Text style={styles.breakdownLabel}>{items.length} productos</Text>
                  </View>
                  
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownIcon}>
                      <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                    </View>
                    <Text style={styles.breakdownLabel}>Pago seguro garantizado</Text>
                  </View>
                </View>

                <Divider style={styles.divider} />

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total a pagar</Text>
                  <View style={styles.totalAmountWrapper}>
                    <Text style={styles.currencySymbol}>Q</Text>
                    <Text style={styles.totalAmount}>{n(total, 0).toFixed(2)}</Text>
                  </View>
                </View>

                {/* Botón de Confirmar */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Pressable
                    onPress={onConfirm}
                    disabled={loading}
                    style={[styles.confirmButton, loading && styles.disabled]}
                  >
                    <LinearGradient
                      colors={loading ? ['#94a3b8', '#64748b'] : ['#10b981', '#059669', '#047857']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.confirmGradient}
                    >
                      {loading ? (
                        <>
                          <Ionicons name="hourglass" size={22} color="#fff" />
                          <Text style={styles.confirmText}>Procesando...</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="lock-closed" size={22} color="#fff" />
                          <Text style={styles.confirmText}>Confirmar compra</Text>
                          <Ionicons name="arrow-forward" size={22} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Badges de seguridad */}
                <View style={styles.securityBadges}>
                  <View style={styles.securityBadge}>
                    <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                    <Text style={styles.securityText}>Cifrado SSL</Text>
                  </View>
                  <View style={styles.securityBadge}>
                    <Ionicons name="lock-closed" size={16} color="#10b981" />
                    <Text style={styles.securityText}>100% Seguro</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </>
        )}

        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={1500}
          style={styles.snackbar}
        >
          {snackMsg}
        </Snackbar>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundGradient: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {},
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },

  listContent: {
    padding: 16,
    paddingBottom: 280,
  },

  itemCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.15)',
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  productIconWrapper: {},
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 20,
  },
  pricePerUnit: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pricePerUnitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  perUnitLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  qtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  qtyBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  lineTotalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lineTotalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },

  summary: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
  },
  summaryGlass: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  breakdown: {
    gap: 12,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  totalAmountWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10b981',
  },
  confirmButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backToShop: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  backToShopGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  backToShopText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  snackbar: {
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 16,
    backgroundColor: '#1e293b',
  },
});