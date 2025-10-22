// CartScreen.tsx - Versión Moderna CORREGIDA
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, FlatList, Image, StyleSheet, Animated, Pressable } from 'react-native';
import {
  Text, Card, IconButton, Button, Surface, Divider, useTheme,
  Snackbar, Portal, Dialog
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

export default function CartScreen({ navigation }: any) {
  const { items, remove, increaseQty, decreaseQty, total, clear } = useCart();
  const theme = useTheme();

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; name: string } | null>(null);

  const n = (x: any, d = 0) => { const v = Number(x); return Number.isFinite(v) ? v : d; };
  const placeholder = 'https://via.placeholder.com/200x200.png?text=Producto';

  // Animaciones principales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    // Pulso sutil continuo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const openConfirmClear = useCallback(() => {
    if (!items.length) return;
    setConfirmClearOpen(true);
  }, [items.length]);

  const confirmClear = useCallback(() => {
    clear();
    setConfirmClearOpen(false);
    setSnackMsg('🗑️ Carrito vaciado exitosamente');
    setSnackVisible(true);
  }, [clear]);

  const openConfirmRemove = useCallback((productId: string, productName: string) => {
    setPendingRemove({ id: String(productId), name: String(productName || '') });
    setConfirmRemoveOpen(true);
  }, []);

  const confirmRemove = useCallback(() => {
    if (pendingRemove?.id) {
      remove(pendingRemove.id);
      setSnackMsg('✅ Producto eliminado del carrito');
      setSnackVisible(true);
    }
    setPendingRemove(null);
    setConfirmRemoveOpen(false);
  }, [pendingRemove, remove]);

  const renderItem = ({ item }: any) => {
    const price = n(item?.product?.price, 0);
    const qty = Math.max(1, n(item?.quantity, 1));
    const line = price * qty;
    const img = item?.product?.image ? String(item.product.image) : placeholder;

    return (
      <LinearGradient
        colors={['#ffffff', '#fef3ff', '#fdf4ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          {/* Imagen con gradiente overlay */}
          <View style={styles.imageWrapper}>
            <Image source={{ uri: img }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(217, 70, 239, 0.1)']}
              style={styles.imageGradient}
            />
          </View>
          
          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={2} style={styles.productName}>
              {item?.product?.name ?? 'Producto'}
            </Text>
            
            {/* Precio con badge */}
            <View style={styles.priceRow}>
              <View style={styles.priceTag}>
                <Text style={styles.currency}>Q</Text>
                <Text style={styles.unitPrice}>{price.toFixed(2)}</Text>
                <Text style={styles.perUnit}>c/u</Text>
              </View>
            </View>

            {/* Controles modernos */}
            <View style={styles.actionsRow}>
              <View style={styles.qtyControl}>
                <Pressable
                  onPress={() => decreaseQty(String(item?.product?.id))}
                  style={styles.qtyButton}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    style={styles.qtyButtonGradient}
                  >
                    <Ionicons name="remove" size={18} color="#fff" />
                  </LinearGradient>
                </Pressable>
                
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>{qty}</Text>
                </View>
                
                <Pressable
                  onPress={() => increaseQty(String(item?.product?.id))}
                  style={styles.qtyButton}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.qtyButtonGradient}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </View>

              <View style={styles.rightSection}>
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.totalBadge}
                >
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>Q {line.toFixed(2)}</Text>
                </LinearGradient>
                
                <Pressable
                  onPress={() => openConfirmRemove(String(item?.product?.id), String(item?.product?.name ?? ''))}
                  style={styles.deleteButton}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    style={styles.deleteGradient}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#60a5fa', '#93c5fd']}
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
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </LinearGradient>
            </Pressable>
            
            <View style={styles.headerCenter}>
              <Ionicons name="cart" size={28} color="#3b82f6" />
              <Text style={styles.headerTitle}>Mi Carrito</Text>
              {items.length > 0 && (
                <View style={styles.itemCount}>
                  <Text style={styles.itemCountText}>{items.length}</Text>
                </View>
              )}
            </View>
            
            <Pressable
              onPress={openConfirmClear}
              disabled={!items.length}
              style={[styles.trashButton, !items.length && styles.disabled]}
            >
              <LinearGradient
                colors={items.length ? ['#ef4444', '#dc2626'] : ['#e5e7eb', '#d1d5db']}
                style={styles.iconButton}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </Animated.View>

        {/* Empty State o Lista */}
        {items.length === 0 ? (
          <Animated.View
            style={[
              styles.empty,
              {
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIcon}>
                <Ionicons name="cart-outline" size={80} color="#d946ef" />
              </View>
              <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
              <Text style={styles.emptySubtitle}>
                ¡Descubre productos increíbles y comienza a comprar!
              </Text>
              
              <Pressable
                onPress={() => navigation.navigate('Products')}
                style={styles.shopButton}
              >
                <LinearGradient
                  colors={['#d946ef', '#c026d3', '#a21caf']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shopButtonGradient}
                >
                  <Ionicons name="storefront" size={22} color="#fff" />
                  <Text style={styles.shopButtonText}>Explorar productos</Text>
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
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              />
            </Animated.View>

            {/* Footer Flotante con Glassmorphism */}
            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
                style={styles.footerGlass}
              >
                <View style={styles.totalSection}>
                  <View>
                    <Text style={styles.totalSectionLabel}>Total a pagar</Text>
                    <View style={styles.totalSectionAmount}>
                      <Text style={styles.currencyLarge}>Q</Text>
                      <Text style={styles.totalLarge}>{n(total, 0).toFixed(2)}</Text>
                    </View>
                  </View>
                  <View style={styles.itemsInfo}>
                    <Ionicons name="cube" size={18} color="#6b7280" />
                    <Text style={styles.itemsInfoText}>{items.length} productos</Text>
                  </View>
                </View>

                <View style={styles.footerActions}>
                  <Pressable
                    onPress={openConfirmClear}
                    disabled={!items.length}
                    style={[styles.clearButtonFooter, !items.length && styles.disabled]}
                  >
                    <View style={styles.clearButtonContent}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      <Text style={styles.clearButtonText}>Vaciar</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate('Checkout')}
                    style={styles.checkoutButton}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669', '#047857']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.checkoutGradient}
                    >
                      <Text style={styles.checkoutText}>Proceder al pago</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </LinearGradient>
                  </Pressable>
                </View>
              </LinearGradient>
            </Animated.View>
          </>
        )}

        {/* Dialogs */}
        <Portal>
          <Dialog visible={confirmClearOpen} onDismiss={() => setConfirmClearOpen(false)}>
            <Dialog.Title>🗑️ Vaciar carrito</Dialog.Title>
            <Dialog.Content>
              <Text>¿Estás seguro de eliminar todos los productos del carrito?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmClearOpen(false)}>Cancelar</Button>
              <Button onPress={confirmClear} textColor="#ef4444">Vaciar</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={confirmRemoveOpen} onDismiss={() => setConfirmRemoveOpen(false)}>
            <Dialog.Title>❌ Eliminar producto</Dialog.Title>
            <Dialog.Content>
              <Text>¿Quitar "{pendingRemove?.name || 'Producto'}" del carrito?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmRemoveOpen(false)}>Cancelar</Button>
              <Button onPress={confirmRemove} textColor="#ef4444">Eliminar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={1800}
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
  itemCount: {
    backgroundColor: '#d946ef',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  itemCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  trashButton: {},
  disabled: { opacity: 0.5 },

  listContent: {
    padding: 16,
    paddingBottom: 200,
  },

  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.2)',
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f3e8ff',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  productName: {
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: 'rgba(217, 70, 239, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currency: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d946ef',
  },
  unitPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#d946ef',
  },
  perUnit: {
    fontSize: 12,
    color: '#9333ea',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {},
  qtyButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  totalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  deleteButton: {},
  deleteGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  shopButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  footer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
  },
  footerGlass: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalSectionLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  totalSectionAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencyLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  totalLarge: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3b82f6',
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  itemsInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButtonFooter: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    overflow: 'hidden',
  },
  clearButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ef4444',
  },
  checkoutButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },

  snackbar: {
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 16,
    backgroundColor: '#1e293b',
  },
});