import React, { useRef, useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Animated,
  View,
  RefreshControl,
  TextInput,
  Pressable,
  Text,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { http } from '../services/http';
import type { Product } from '../data/products';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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

const toProduct = (p: UiProduct): Product => ({
  id: String(p.id),
  name: String(p.name),
  price: Number.isFinite(Number(p.price)) ? Number(p.price) : 0,
  image: p.imageUrl || undefined,
});

export default function ProductsScreen({ navigation }: any) {
  const { add, items } = useCart();
  const { logout } = useAuth();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const fetchPage = async (pageToLoad: number, replace = false, searchQuery?: string) => {
    const setLoad = pageToLoad === 1 && !refreshing ? setLoading : setLoadingMore;
    setLoad(true);
    setError(null);
    try {
      const res = await http.get<{ data: ApiProduct[] }>('/catalog/products', {
        params: {
          search: searchQuery !== undefined ? searchQuery : (search || undefined),
          page: pageToLoad,
          pageSize: PAGE_SIZE,
        },
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

  useEffect(() => {
    fetchPage(1, true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const onSearchSubmit = () => {
    setRefreshing(true);
    fetchPage(1, true);
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (text === '') fetchPage(1, true, '');
  };

  const onEndReached = () => {
    if (!loadingMore && !loading && hasNext) fetchPage(page + 1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPage(1, true);
  };

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const renderProductCard = ({ item }: { item: UiProduct }) => {
    const prod = toProduct(item);
    return (
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <Pressable style={styles.card}>
          <LinearGradient colors={['#fef3ff', '#fdf4ff']} style={styles.cardGradient}>
            <View style={styles.imageContainer}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="contain" />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={48} color="#d946ef" />
                </View>
              )}
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.brand && <Text style={styles.brandText}>{item.brand}</Text>}
              <Text style={styles.skuText}>SKU: {item.sku}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Q</Text>
                <Text style={styles.price}>
                  {item.price.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <Pressable onPress={() => add(prod, 1)} style={styles.addButton}>
                <LinearGradient
                  colors={['#3b82f6', '#60a5fa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="cart" size={18} color="#fff" />
                  <Text style={styles.addButtonText}>Agregar</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.gradient}>
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient colors={['#dc2626', '#f87171']} style={styles.iconGradientInner}>
                <Ionicons name="storefront" size={28} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.greeting}>Bienvenido 👋</Text>
                <Text style={styles.title}>Catálogo</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
                <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.cartGradient}>
                  <Ionicons name="cart" size={24} color="#fff" />
                  {cartItemsCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartItemsCount}</Text>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
              <Pressable onPress={logout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={24} color="#fb923c" />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.searchGlass}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={22} color="#d946ef" style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={handleSearchChange}
                placeholder="Buscar productos..."
                placeholderTextColor="#94a3b8"
                returnKeyType="search"
                onSubmitEditing={onSearchSubmit}
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => handleSearchChange('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#d946ef" />
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={products}
            keyExtractor={(p) => String(p.id)}
            renderItem={renderProductCard}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#fb923c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconGradientInner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { fontSize: 14, color: '#fff', fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '900', color: '#fff' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartButton: { position: 'relative' },
  cartGradient: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  logoutButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchGlass: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, borderWidth: 1, borderColor: '#e9d5ff' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56 },
  searchInput: { flex: 1, color: '#1e293b', fontSize: 16 },
  clearButton: { padding: 4 },

  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  cardContainer: { width: CARD_WIDTH },
  card: { borderRadius: 20, overflow: 'hidden', elevation: 4 },
  cardGradient: { borderWidth: 1, borderColor: '#e9d5ff' },
  imageContainer: { width: '100%', height: 160, backgroundColor: '#fef3ff', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  placeholderImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3e8ff' },
  categoryBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#dc2626' },
  categoryText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardContent: { padding: 12, gap: 4 },
  productName: { fontSize: 15, fontWeight: '700', color: '#000' },
  brandText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  skuText: { fontSize: 11, color: '#6b7280' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  priceLabel: { fontSize: 16, fontWeight: '700', color: '#059669' },
  price: { fontSize: 20, fontWeight: '900', color: '#047857' },
  addButton: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  addButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, marginHorizontal: 16, marginTop: 16, backgroundColor: 'rgba(251, 146, 60, 0.2)', borderRadius: 16 },
  errorText: { color: '#fb923c', fontSize: 14, fontWeight: '600' },
});
