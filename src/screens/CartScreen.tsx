// CartScreen.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, FlatList, Image, StyleSheet, Animated } from 'react-native';
import {
  Text, Card, IconButton, Button, Surface, Divider, useTheme,
  Snackbar, Portal, Dialog
} from 'react-native-paper';
import { useCart } from '../contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen({ navigation }: any) {
  const { items, remove, increaseQty, decreaseQty, total, clear } = useCart();
  const theme = useTheme();

  // Snackbar
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  // Dialogs (confirmaciones)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; name: string } | null>(null);

  // helpers
  const n = (x: any, d = 0) => { const v = Number(x); return Number.isFinite(v) ? v : d; };
  const placeholder = 'https://via.placeholder.com/200x200.png?text=Producto';

  // anim
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }, []);

  // ---------- Acciones ----------
  const openConfirmClear = useCallback(() => {
    if (!items.length) return;
    setConfirmClearOpen(true);
  }, [items.length]);

  const confirmClear = useCallback(() => {
    clear();
    setConfirmClearOpen(false);
    setSnackMsg('Carrito vaciado');
    setSnackVisible(true);
  }, [clear]);

  const openConfirmRemove = useCallback((productId: string, productName: string) => {
    setPendingRemove({ id: String(productId), name: String(productName || '') });
    setConfirmRemoveOpen(true);
  }, []);

  const confirmRemove = useCallback(() => {
    if (pendingRemove?.id) {
      remove(pendingRemove.id);
      setSnackMsg('Producto eliminado');
      setSnackVisible(true);
    }
    setPendingRemove(null);
    setConfirmRemoveOpen(false);
  }, [pendingRemove, remove]);

<<<<<<< HEAD
  // (Útil para debug) eliminar sin confirmar:
  // const quickRemove = (id: string) => { remove(id); setSnackMsg('Producto eliminado'); setSnackVisible(true); };

  const renderItem = ({ item }: any) => {
    const price = n(item?.product?.price, 0);
    const qty   = Math.max(1, n(item?.quantity, 1));
    const line  = price * qty;
    const img   = item?.product?.image ? String(item.product.image) : placeholder;
=======
  const handleRemoveItem = (productId: string | number, productName: string) => {
    Alert.alert('Eliminar producto', `¿Deseas quitar "${productName}" del carrito?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(String(productId)) },
    ]);
  };

  const handleChangeQty = (productId: string | number, qty: number) => {
    if (qty < 1) remove(String(productId));
    else setQty(String(productId), qty);
  };
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280

    return (
      <Card style={styles.card} elevation={2} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <Image source={{ uri: img }} style={styles.image} />
          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: '700' }}>
              {item?.product?.name ?? 'Producto'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Q {price.toFixed(2)} c/u
            </Text>

<<<<<<< HEAD
            <View style={styles.row}>
              <View style={styles.qty}>
                <IconButton
                  icon={() => <Ionicons name="remove-circle-outline" size={22} color={theme.colors.error} />}
                  size={24}
                  onPress={() => decreaseQty(String(item?.product?.id))}
                />
                <Text style={styles.qtyText}>{qty}</Text>
                <IconButton
                  icon={() => <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />}
                  size={24}
                  onPress={() => increaseQty(String(item?.product?.id))}
                />
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                  Q {line.toFixed(2)}
                </Text>
                <IconButton
                  icon={() => <Ionicons name="trash-outline" size={20} color="#fff" />}
                  onPress={() => openConfirmRemove(String(item?.product?.id), String(item?.product?.name ?? ''))}
                  style={{ backgroundColor: theme.colors.error, marginTop: 6 }}
                  size={20}
                />
              </View>
=======
          <View style={styles.row}>
            <View style={styles.qty}>
              <IconButton
                icon={() => <Ionicons name="remove-circle-outline" size={22} color={theme.colors.error} />}
                size={24}
                onPress={() => decreaseQty(String(item.product.id))}
                mode="contained"
                containerColor="transparent"
                accessibilityLabel="Disminuir cantidad"
              />
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <IconButton
                icon={() => <Ionicons name="add-circle-outline" size={22} color={(theme.colors as any).success ?? theme.colors.primary} />}
                size={24}
                onPress={() => increaseQty(String(item.product.id))}
                mode="contained"
                containerColor="transparent"
                accessibilityLabel="Aumentar cantidad"
              />
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Q {(item.product.price * item.quantity).toFixed(2)}
              </Text>
              <IconButton
                icon={() => <Ionicons name="trash-outline" size={20} color="#fff" />}
                onPress={() => handleRemoveItem(String(item.product.id), item.product.name)}
                style={{ backgroundColor: theme.colors.error, marginTop: 4 }}
                size={20}
                accessibilityLabel="Eliminar producto"
              />
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <IconButton
          icon={() => <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />}
          onPress={() => navigation.goBack()}
        />
        <Text variant="titleLarge" style={styles.title}>Mi Carrito</Text>
        <IconButton
          icon={() => <Ionicons name="trash-outline" size={22} color={items.length ? theme.colors.error : '#bbb'} />}
          onPress={openConfirmClear}
          disabled={!items.length}
          accessibilityLabel="Vaciar carrito"
        />
      </Surface>

      {/* Lista */}
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="displaySmall">🛒</Text>
          <Text variant="titleLarge" style={{ marginTop: 12, fontWeight: '700' }}>Tu carrito está vacío</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginVertical: 8 }}>
            Agrega productos para comenzar.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Products')}
            style={{ marginTop: 8, borderRadius: 12 }}
            buttonColor={theme.colors.primary}
            textColor="#fff"
          >
            Ver productos
          </Button>
        </View>
      ) : (
        <>
          <Animated.View style={{
            flex: 1, opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }]
          }}>
            <FlatList
              data={items}
<<<<<<< HEAD
              keyExtractor={(i) => String(i?.product?.id ?? Math.random())}
=======
              keyExtractor={(i) => String(i.product.id)}   // 🔑 consistente con normalizeId
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <Divider style={{ marginVertical: 6 }} />}
              extraData={items}                            // 🔁 fuerza rerender si alguna memo quedara
            />
          </Animated.View>

          {/* Footer */}
          <Surface style={styles.footer} elevation={6}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>Total</Text>
              <Text variant="headlineSmall" style={{ fontWeight: '800', color: theme.colors.primary }}>
                Q {n(total, 0).toFixed(2)}
              </Text>
            </View>

<<<<<<< HEAD
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={openConfirmClear}
                style={styles.clearBtn}
                textColor={theme.colors.error}
                icon={() => <Ionicons name="trash-outline" size={18} color={theme.colors.error} />}
                disabled={!items.length}
              >
                Vaciar
              </Button>

              <Button
                mode="contained"
                onPress={() => navigation.navigate('Checkout')}
                style={styles.checkoutBtn}
                buttonColor={theme.colors.primary}
                textColor="#fff"
                icon={() => <Ionicons name="arrow-forward" size={18} color="#fff" />}
              >
                Proceder al pago
              </Button>
            </View>
=======
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Checkout')}
              style={styles.checkoutBtn}
              buttonColor={(theme.colors as any).success ?? theme.colors.primary}
              textColor="#fff"
              icon={() => <Ionicons name="arrow-forward" size={18} color="#fff" />}
            >
              Proceder al pago
            </Button>

            <FAB
              icon={() => <Ionicons name="trash-outline" size={18} color="#fff" />}
              style={styles.fab}
              onPress={handleClearCart}
              visible={items.length > 0}
              label="Vaciar"
              variant="tertiary"
            />
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
          </Surface>
        </>
      )}

      {/* Dialogs de confirmación */}
      <Portal>
        <Dialog visible={confirmClearOpen} onDismiss={() => setConfirmClearOpen(false)}>
          <Dialog.Title>Vaciar carrito</Dialog.Title>
          <Dialog.Content>
            <Text>¿Deseas eliminar todos los productos?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmClearOpen(false)}>Cancelar</Button>
            <Button onPress={confirmClear} textColor={theme.colors.error}>Vaciar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={confirmRemoveOpen} onDismiss={() => setConfirmRemoveOpen(false)}>
          <Dialog.Title>Eliminar producto</Dialog.Title>
          <Dialog.Content>
            <Text>¿Quitar “{pendingRemove?.name || 'Producto'}” del carrito?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmRemoveOpen(false)}>Cancelar</Button>
            <Button onPress={confirmRemove} textColor={theme.colors.error}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={1400}
        style={{ marginHorizontal: 12, marginBottom: 90, borderRadius: 12 }}
      >
        {snackMsg}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 8, marginBottom: 8, backgroundColor: '#fff',
    borderRadius: 12, margin: 12,
  },
  title: { textAlign: 'center', flex: 1 },

  card: { borderRadius: 14, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', alignItems: 'center' /* evita gap por compatibilidad */ },
  image: { width: 92, height: 92, borderRadius: 12, backgroundColor: '#eee', marginRight: 12 },
  info: { flex: 1, paddingLeft: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qty: { flexDirection: 'row', alignItems: 'center' },
  qtyText: { fontWeight: '700', marginHorizontal: 8 },

  footer: {
<<<<<<< HEAD
    position: 'absolute', left: 12, right: 12, bottom: 18,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
  },
  actions: {
    flexDirection: 'row', gap: 10, marginTop: 12,
    alignItems: 'center', justifyContent: 'space-between',
  },
  clearBtn: { flexGrow: 1, borderRadius: 12, borderWidth: 1.5, borderColor: '#ef4444' },
  checkoutBtn: { flexGrow: 2, borderRadius: 12, paddingHorizontal: 12 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
=======
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutBtn: { paddingHorizontal: 16, borderRadius: 12, marginRight: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#fb923c' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
});
