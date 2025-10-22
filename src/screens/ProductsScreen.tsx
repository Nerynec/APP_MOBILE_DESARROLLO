import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Animated, View, Alert, RefreshControl } from 'react-native';
import { Text, Surface, useTheme, IconButton, Badge, FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { http } from '../services/http';
<<<<<<< HEAD
import type { Product } from '../data/products';
=======
// ...

>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280

// ---- Tipos API/UI ----
type UiProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  sku: string;
  brand?: string;
  category?: string;
};
type ApiProduct = {
  product_id: number;
  sku: string;
  name: string;
  sale_price: string;
  image_url: string | null;
  brands?: { name: string };
  categories?: { name: string };
};
const mapApiToUi = (p: ApiProduct): UiProduct => ({
  id: String(p.product_id),
  name: p.name,
  price: Number(p.sale_price ?? 0),
  imageUrl: p.image_url,
  sku: p.sku,
  brand: p.brands?.name,
  category: p.categories?.name,
});

// UiProduct -> Product (el que usa CartContext y ProductCard)
const toProduct = (p: UiProduct): Product => ({
  id: String(p.id),
  name: String(p.name),
  price: Number.isFinite(Number(p.price)) ? Number(p.price) : 0,
  image: p.imageUrl || undefined,
});

export default function ProductsScreen({ navigation }: any) {
  const { add, items, clear } = useCart();
  const { logout } = useAuth();
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [error, setError] = useState<string | null>(null);


const onLogout = async () => {
  await logout();
  // manda al stack público (Login/Register)
  navigation.reset({ index: 0, routes: [{ name: "Login" }] });
};


  const fetchPage = async (pageToLoad: number, replace = false) => {
    const setLoad = pageToLoad === 1 && !refreshing ? setLoading : setLoadingMore;
    setLoad(true);
    setError(null);
    try {
      const res = await http.get<{ data: ApiProduct[] }>('/catalog/products', {
        params: { search: search || undefined, page: pageToLoad, pageSize: PAGE_SIZE },
      });
      const items = (res.data?.data ?? []).map(mapApiToUi);
      setHasNext(items.length === PAGE_SIZE);
      if (replace) setProducts(items);
      else setProducts((prev) => (pageToLoad === 1 ? items : [...prev, ...items]));
      setPage(pageToLoad);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudieron cargar los productos');
    } finally {
      setLoad(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPage(1, true); }, []);

  const onSearchSubmit = () => { setRefreshing(true); fetchPage(1, true); };
  const onEndReached = () => { if (!loadingMore && !loading && hasNext) fetchPage(page + 1); };
  const onRefresh = () => { setRefreshing(true); fetchPage(1, true); };

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // animación
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
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
      <Surface elevation={3} style={styles.header}>
        <View>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Bienvenido</Text>
          <Text variant="headlineMedium" style={{ fontWeight: '800', color: theme.colors.primary }}>Nuestros Productos</Text>
        </View>
        <View style={styles.actions}>
<<<<<<< HEAD
          <View>
            <IconButton icon={() => <Ionicons name="cart" size={22} color="#fff" />} style={{ backgroundColor: theme.colors.primary }} onPress={() => navigation.navigate('Cart')} />
            {cartItemsCount > 0 && <Badge size={18} style={{ position: 'absolute', top: 2, right: 2, backgroundColor: theme.colors.error, color: '#fff' }}>{cartItemsCount}</Badge>}
          </View>
          
          <IconButton icon={() => <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />} onPress={logout} style={styles.logoutBtn} mode="contained-tonal" />
        </View>
=======
<IconButton
  icon={() => <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />}
  onPress={onLogout}
  style={styles.logoutBtn}
  mode="contained-tonal"
/>       </View>
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
      </Surface>

      <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
        <Searchbar placeholder="Buscar productos" value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={onSearchSubmit} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        {loading && products.length === 0 ? (
          <View style={{ paddingTop: 40 }}><ActivityIndicator /></View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => String(p.id)}
            renderItem={({ item }) => {
              const prod = toProduct(item);
              return (
                <ProductCard
                  product={prod}
                  onAdd={(p) => add(p, 1)}
                />
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            ListFooterComponent={loadingMore ? <View style={{ paddingVertical: 16 }}><ActivityIndicator /></View> : null}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
        {error ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.colors.error }}>{error}</Text>
          </View>
        ) : null}
      </Animated.View>

      {cartItemsCount > 0 && (
        <FAB icon="cart-check" label={`Ver carrito (${cartItemsCount})`} style={[styles.fab, { backgroundColor: theme.colors.success }]} color="#fff" onPress={() => navigation.navigate('Cart')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12, margin: 12, borderRadius: 16, backgroundColor: '#fff',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listContent: { paddingHorizontal: 12, paddingBottom: 90 },
  fab: { position: 'absolute', bottom: 20, right: 20, borderRadius: 30, elevation: 6 },
  logoutBtn: { backgroundColor: '#fff' },
});
