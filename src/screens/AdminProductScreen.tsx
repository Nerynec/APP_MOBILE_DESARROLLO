// src/screens/AdminProductScreen.tsx - Ultra Moderno
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '../services/products';
import { getProducts, deleteProduct } from '../services/products';

type SortBy = 'id' | 'name' | 'price';

type State = {
  loading: boolean;
  error: string;
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortBy;
  deletingId: number | null;
  loadingMore: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
};

function money(n: any) {
  return Number(n ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function firstLetter(name?: string) {
  return (name?.[0] || 'P').toUpperCase();
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 12 * 3 - 12) / 2;

export default class AdminProductScreen extends React.Component<any, State> {
  private timer?: NodeJS.Timeout;

  constructor(props: any) {
    super(props);
    this.state = {
      loading: false,
      error: '',
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      search: '',
      sortBy: 'id',
      deletingId: null,
      loadingMore: false,
      fadeAnim: new Animated.Value(0),
      slideAnim: new Animated.Value(-20),
    };
  }

  componentDidMount() {
    this.fetch();
    this.animateIn();
  }

  animateIn() {
    Animated.parallel([
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(this.state.slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async fetch(reset = false) {
    const { page, pageSize, search } = this.state;
    this.setState({ loading: reset ? true : this.state.items.length === 0, error: '' });
    try {
      const { data, meta } = await getProducts({
        search: search || undefined,
        page,
        pageSize,
      });
      this.setState((s) => ({
        items: reset ? data : (page === 1 ? data : [...s.items, ...data]),
        total: Number(meta?.total ?? 0),
      }));
    } catch (e: any) {
      this.setState({ error: e?.response?.data?.message || 'No se pudo cargar productos' });
    } finally {
      this.setState({ loading: false, loadingMore: false });
    }
  }

  debouncedSearch = (text: string) => {
    if (this.timer) clearTimeout(this.timer);
    this.setState({ search: text });
    this.timer = setTimeout(() => {
      this.setState({ page: 1 }, () => this.fetch(true));
    }, 350);
  };

  changeSort = (sortBy: SortBy) => this.setState({ sortBy });

  sortedData(): Product[] {
    const { items, sortBy } = this.state;
    const arr = [...items];
    switch (sortBy) {
      case 'name': return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'price': return arr.sort((a, b) => Number(a.sale_price || 0) - Number(b.sale_price || 0));
      case 'id':
      default: return arr.sort((a, b) => Number(a.product_id || 0) - Number(b.product_id || 0));
    }
  }

  loadMore = () => {
    const { loadingMore, loading, items, total, page } = this.state;
    if (loading || loadingMore) return;
    if (items.length >= total) return;
    this.setState({ page: page + 1, loadingMore: true }, () => this.fetch());
  };

  openCreate = () => this.props.navigation.navigate('ProductForm');
  openEdit = (id: number) => this.props.navigation.navigate('ProductForm', { id });

  onDelete = async (id: number) => {
    this.setState({ deletingId: id });
    try {
      await deleteProduct(id);
      this.setState({ page: 1 }, () => this.fetch(true));
    } catch (e: any) {
      // muestra snackbar/alert si quieres
    } finally {
      this.setState({ deletingId: null });
    }
  };

  renderCard = ({ item }: { item: Product }) => (
    <View style={st.card}>
      <LinearGradient
        colors={['#ffffff', '#fef3ff', '#fdf4ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.cardGradient}
      >
        <View style={st.thumbWrap}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={st.thumb} />
          ) : (
            <LinearGradient colors={['#d946ef', '#c026d3']} style={st.thumbFallback}>
              <Text style={st.thumbFallbackText}>{firstLetter(item.name)}</Text>
            </LinearGradient>
          )}
          <View style={st.skuBadge}>
            <Ionicons name="barcode-outline" size={12} color="#fff" />
          </View>
        </View>

        <View style={st.cardContent}>
          <Text style={st.title} numberOfLines={2}>{item.name}</Text>
          <Text style={st.sub} numberOfLines={1}>SKU: {item.sku || '—'}</Text>
          
          <View style={st.priceRow}>
            <View style={st.priceTag}>
              <Text style={st.currency}>Q</Text>
              <Text style={st.price}>{money(item.sale_price)}</Text>
            </View>
          </View>

          <Pressable onPress={() => this.openEdit(item.product_id)} style={st.editButton}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={st.editGradient}
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={st.editText}>Editar</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );

  render() {
    const { loading, error, search, sortBy, items, total, loadingMore, fadeAnim, slideAnim } = this.state;
    const data = this.sortedData();

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={st.safe}>
          <LinearGradient
            colors={['#3b82f6', '#60a5fa', '#93c5fd']}
            style={st.backgroundGradient}
          >
            {/* Header */}
            <Animated.View
              style={[
                st.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={st.headerGlass}
              >
                <View style={st.headerLeft}>
                  <LinearGradient colors={['#d946ef', '#c026d3']} style={st.iconCircle}>
                    <Ionicons name="cube" size={24} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={st.h1}>Productos</Text>
                    <Text style={st.h1Sub}>{total} en catálogo</Text>
                  </View>
                </View>
                <Pressable onPress={this.openCreate} style={st.btnPrimary}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={st.btnPrimaryGradient}
                  >
                    <Ionicons name="add-circle" size={20} color="#fff" />
                    <Text style={st.btnPrimaryText}>Nuevo</Text>
                  </LinearGradient>
                </Pressable>
              </LinearGradient>
            </Animated.View>

            {/* Search + Sort */}
            <Animated.View
              style={[
                st.toolbar,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={st.searchContainer}>
                <Ionicons name="search" size={20} color="#d946ef" style={st.searchIcon} />
                <TextInput
                  placeholder="Buscar por nombre, SKU..."
                  defaultValue={search}
                  onChangeText={this.debouncedSearch}
                  style={st.input}
                  returnKeyType="search"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={st.sortRow}>
                <Pressable
                  onPress={() => this.changeSort('id')}
                  style={[st.sortBtn, sortBy === 'id' && st.sortActive]}
                >
                  <LinearGradient
                    colors={sortBy === 'id' ? ['#d946ef', '#c026d3'] : ['transparent', 'transparent']}
                    style={st.sortGradient}
                  >
                    <Ionicons
                      name="finger-print-outline"
                      size={16}
                      color={sortBy === 'id' ? '#fff' : '#64748b'}
                    />
                    <Text style={[st.sortText, sortBy === 'id' && st.sortTextActive]}>ID</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => this.changeSort('name')}
                  style={[st.sortBtn, sortBy === 'name' && st.sortActive]}
                >
                  <LinearGradient
                    colors={sortBy === 'name' ? ['#d946ef', '#c026d3'] : ['transparent', 'transparent']}
                    style={st.sortGradient}
                  >
                    <Ionicons
                      name="text-outline"
                      size={16}
                      color={sortBy === 'name' ? '#fff' : '#64748b'}
                    />
                    <Text style={[st.sortText, sortBy === 'name' && st.sortTextActive]}>Nombre</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => this.changeSort('price')}
                  style={[st.sortBtn, sortBy === 'price' && st.sortActive]}
                >
                  <LinearGradient
                    colors={sortBy === 'price' ? ['#d946ef', '#c026d3'] : ['transparent', 'transparent']}
                    style={st.sortGradient}
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={16}
                      color={sortBy === 'price' ? '#fff' : '#64748b'}
                    />
                    <Text style={[st.sortText, sortBy === 'price' && st.sortTextActive]}>Precio</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>

            {/* Lista */}
            {loading && items.length === 0 ? (
              <View style={st.center}>
                <ActivityIndicator size="large" color="#d946ef" />
                <Text style={st.loadingText}>Cargando productos...</Text>
              </View>
            ) : error ? (
              <View style={st.center}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                  style={st.errorCard}
                >
                  <Ionicons name="alert-circle" size={48} color="#ef4444" />
                  <Text style={st.errorText}>{error}</Text>
                </LinearGradient>
              </View>
            ) : (
              <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <FlatList
                  data={data}
                  keyExtractor={(p) => String(p.product_id)}
                  renderItem={this.renderCard}
                  numColumns={2}
                  columnWrapperStyle={st.columnWrapper}
                  contentContainerStyle={st.listContent}
                  ListEmptyComponent={
                    <View style={st.center}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                        style={st.emptyCard}
                      >
                        <Ionicons name="cube-outline" size={64} color="#d946ef" />
                        <Text style={st.emptyTitle}>No hay productos</Text>
                        <Text style={st.emptyText}>Comienza agregando tu primer producto</Text>
                      </LinearGradient>
                    </View>
                  }
                  onEndReachedThreshold={0.4}
                  onEndReached={this.loadMore}
                  ListFooterComponent={
                    items.length < total ? (
                      <View style={st.footer}>
                        {loadingMore ? (
                          <ActivityIndicator color="#d946ef" />
                        ) : (
                          <Pressable onPress={this.loadMore} style={st.loadMoreButton}>
                            <LinearGradient
                              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                              style={st.loadMoreGradient}
                            >
                              <Ionicons name="arrow-down-circle" size={20} color="#d946ef" />
                              <Text style={st.loadMoreText}>Cargar más</Text>
                            </LinearGradient>
                          </Pressable>
                        )}
                      </View>
                    ) : null
                  }
                />
              </Animated.View>
            )}
          </LinearGradient>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

const st = StyleSheet.create({
  safe: { flex: 1 },
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
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
  },
  h1Sub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  btnPrimary: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },

  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  sortActive: {},
  sortGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  sortText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 13,
  },
  sortTextActive: {
    color: '#fff',
  },

  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.2)',
  },
  thumbWrap: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#f3e8ff',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFallbackText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 32,
  },
  skuBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 6,
  },

  cardContent: {
    padding: 12,
    gap: 6,
  },
  title: {
    fontWeight: '800',
    color: '#1e293b',
    fontSize: 15,
    lineHeight: 20,
  },
  sub: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  priceRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currency: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  editGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  editText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  errorCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },

  footer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  loadMoreText: {
    color: '#d946ef',
    fontWeight: '800',
    fontSize: 14,
  },
});