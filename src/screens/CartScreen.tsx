import React, { useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Image,
  Alert,
  StyleSheet,
  Animated,
} from 'react-native';
import { Text, Card, IconButton, Button, FAB, Surface, Divider, useTheme } from 'react-native-paper';
import { useCart } from '../contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen({ navigation }: any) {
  const { items, remove, setQty, increaseQty, decreaseQty, total, clear } = useCart();
  const theme = useTheme();

  // Animación de entrada para lista
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClearCart = () => {
    if (!items.length) return;
    Alert.alert('Vaciar carrito', '¿Deseas eliminar todos los productos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: clear },
    ]);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert('Eliminar producto', `¿Deseas quitar "${productName}" del carrito?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(productId) },
    ]);
  };

  const handleChangeQty = (productId: string, qty: number) => {
    if (qty < 1) remove(productId);
    else setQty(productId, qty);
  };

  const renderItem = ({ item }: any) => (
    <Card style={styles.card} elevation={2} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <Image source={{ uri: item.product.image }} style={styles.image} />
        <View style={styles.info}>
          <Text variant="titleMedium" numberOfLines={1} style={{ fontWeight: '700' }}>
            {item.product.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Q {item.product.price.toFixed(2)} c/u
          </Text>

          <View style={styles.row}>
            <View style={styles.qty}>
              <IconButton
                icon={() => <Ionicons name="remove-circle-outline" size={22} color={theme.colors.error} />}
                size={24}
                onPress={() => decreaseQty(item.product.id)}
                mode="contained"
                containerColor="transparent"
              />
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <IconButton
                icon={() => <Ionicons name="add-circle-outline" size={22} color={theme.colors.success} />}
                size={24}
                onPress={() => increaseQty(item.product.id)}
                mode="contained"
                containerColor="transparent"
              />
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Q {(item.product.price * item.quantity).toFixed(2)}
              </Text>
              <IconButton
                icon={() => <Ionicons name="trash-outline" size={20} color="#fff" />}
                onPress={() => handleRemoveItem(item.product.id, item.product.name)}
                style={{ backgroundColor: theme.colors.error }}
                size={20}
              />
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <IconButton
          icon={() => <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />}
          onPress={() => navigation.goBack()}
        />
        <Text variant="titleLarge" style={styles.title}>
          Mi Carrito
        </Text>
        <IconButton
          icon={() => <Ionicons name="trash-outline" size={22} color={items.length ? theme.colors.error : '#bbb'} />}
          onPress={handleClearCart}
          disabled={!items.length}
        />
      </Surface>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="displaySmall">🛒</Text>
          <Text variant="titleLarge" style={{ marginTop: 12, fontWeight: '700' }}>
            Tu carrito está vacío
          </Text>
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
          <Animated.View
            style={{
              flex: 1,
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            }}
          >
            <FlatList
              data={items}
              keyExtractor={(i) => i.product.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <Divider style={{ marginVertical: 6 }} />}
            />
          </Animated.View>

          {/* Footer */}
          <Surface style={styles.footer} elevation={6}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Total
              </Text>
              <Text variant="headlineSmall" style={{ fontWeight: '800', color: theme.colors.primary }}>
                Q {total.toFixed(2)}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={() => navigation.navigate('Checkout')}
              style={styles.checkoutBtn}
              buttonColor={theme.colors.success}
              textColor="#fff"
              icon={() => <Ionicons name="arrow-forward" size={18} color="#fff" />}
            >
              Proceder al pago
            </Button>

            <FAB
              icon={() => <Ionicons name="trash-outline" size={18} color="#fff" />}
              style={styles.fab}
              small
              onPress={handleClearCart}
              visible={items.length > 0}
              label="Vaciar"
              extended={false}
              variant="tertiary"
            />
          </Surface>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 12,
  },
  title: { textAlign: 'center', flex: 1 },
  card: { borderRadius: 14, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 92, height: 92, borderRadius: 12, backgroundColor: '#eee' },
  info: { flex: 1, paddingLeft: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qty: { flexDirection: 'row', alignItems: 'center' },
  qtyText: { fontWeight: '700', marginHorizontal: 8 },
  footer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkoutBtn: {
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fb923c',
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});
