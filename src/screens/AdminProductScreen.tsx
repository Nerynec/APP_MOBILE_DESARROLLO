// src/screens/AdminProductScreen.tsx
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
} from 'react-native';
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
};

function money(n: any) {
  return Number(n ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function firstLetter(name?: string) {
  return (name?.[0] || 'P').toUpperCase();
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 12 * 3 - 12) / 2; // padding + gap + margin

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
    };
  }

  componentDidMount() {
    this.fetch();
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
      // muestra un snackbar/alert si quieres
    } finally {
      this.setState({ deletingId: null });
    }
  };

  renderCard = ({ item }: { item: Product }) => (
    <View style={st.card}>
      <View style={st.thumbWrap}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={st.thumb} />
        ) : (
          <View style={st.thumbFallback}><Text style={st.thumbFallbackText}>{firstLetter(item.name)}</Text></View>
        )}
      </View>
      <Text style={st.title} numberOfLines={1}>{item.name}</Text>
      <Text style={st.sub} numberOfLines={1}>SKU: {item.sku || '—'}</Text>
      <Text style={st.price}>Q{money(item.sale_price)}</Text>
      <Pressable onPress={() => this.openEdit(item.product_id)} style={[st.btn, st.btnPrimaryCard]}>
        <Text style={st.btnPrimaryTextCard}>Editar</Text>
      </Pressable>
    </View>
  );

  render() {
    const { loading, error, search, sortBy, items, total, loadingMore } = this.state;
    const data = this.sortedData();

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={st.safe}>
          {/* Header */}
          <View style={st.header}>
            <Text style={st.h1}>Productos</Text>
            <Pressable onPress={this.openCreate} style={st.btnPrimary}>
              <Text style={st.btnPrimaryText}>＋ Agregar</Text>
            </Pressable>
          </View>

          {/* Search + Sort */}
          <View style={st.toolbar}>
            <TextInput
              placeholder="Buscar por nombre, SKU o código…"
              defaultValue={search}
              onChangeText={this.debouncedSearch}
              style={st.input}
              returnKeyType="search"
            />
            <View style={st.sortRow}>
              <Pressable onPress={() => this.changeSort('id')} style={[st.sortBtn, sortBy === 'id' && st.sortActive]}>
                <Text style={[st.sortText, sortBy === 'id' && st.sortTextActive]}>ID</Text>
              </Pressable>
              <Pressable onPress={() => this.changeSort('name')} style={[st.sortBtn, sortBy === 'name' && st.sortActive]}>
                <Text style={[st.sortText, sortBy === 'name' && st.sortTextActive]}>Nombre</Text>
              </Pressable>
              <Pressable onPress={() => this.changeSort('price')} style={[st.sortBtn, sortBy === 'price' && st.sortActive]}>
                <Text style={[st.sortText, sortBy === 'price' && st.sortTextActive]}>Precio</Text>
              </Pressable>
            </View>
          </View>

          {/* Lista */}
          {loading && items.length === 0 ? (
            <View style={st.center}><ActivityIndicator size="large" color="#2563eb" /></View>
          ) : error ? (
            <View style={st.center}><Text style={{ color: '#b91c1c' }}>{error}</Text></View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(p) => String(p.product_id)}
              renderItem={this.renderCard}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 }}
              contentContainerStyle={{ paddingBottom: 12 }}
              ListEmptyComponent={<View style={st.center}><Text style={{ color: '#64748b' }}>No hay productos</Text></View>}
              onEndReachedThreshold={0.4}
              onEndReached={this.loadMore}
              ListFooterComponent={
                items.length < total ? (
                  <View style={{ padding: 12, alignItems: 'center' }}>
                    {loadingMore ? (
                      <ActivityIndicator />
                    ) : (
                      <Pressable onPress={this.loadMore} style={[st.btn, st.btnGhost]}>
                        <Text style={st.btnGhostText}>Cargar más</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null
              }
            />
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#e0f2fe' }, // azul celeste claro
  header: { paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  h1: { fontSize: 26, fontWeight: '900', color: '#1e3a8a' },
  btnPrimary: { marginLeft: 'auto', backgroundColor: '#2563eb', paddingHorizontal: 14, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: 'white', fontWeight: '900', fontSize: 16 },

  toolbar: { padding: 12, gap: 10 },
  input: { height: 44, borderWidth: 2, borderColor: '#3b82f6', borderRadius: 14, paddingHorizontal: 12, backgroundColor: 'white' },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortBtn: { flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#3b82f6', backgroundColor: 'white', alignItems: 'center' },
  sortActive: { backgroundColor: '#93c5fd' },
  sortText: { color: '#1e3a8a', fontWeight: '600' },
  sortTextActive: { color: '#1e40af', fontWeight: '900' },

  card: { width: CARD_WIDTH, backgroundColor: 'white', borderRadius: 18, padding: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
  thumbWrap: { width: '100%', height: 120, borderRadius: 14, overflow: 'hidden', marginBottom: 8, backgroundColor: '#60a5fa', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: { width: '100%', height: '100%', backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  thumbFallbackText: { color: 'white', fontWeight: '900', fontSize: 24 },

  title: { fontWeight: '800', color: '#1e3a8a', fontSize: 16, marginBottom: 2 },
  sub: { color: '#374151', fontSize: 12, marginBottom: 4 },
  price: { fontWeight: '900', color: '#10b981', fontSize: 16, marginBottom: 8 },

  btn: { height: 40, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnPrimaryCard: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  btnPrimaryTextCard: { color: 'white', fontWeight: '900' },
  btnGhost: { borderColor: '#2563eb', backgroundColor: 'white' },
  btnGhostText: { color: '#2563eb', fontWeight: '700' },

  center: { padding: 24, alignItems: 'center', justifyContent: 'center' },
});
