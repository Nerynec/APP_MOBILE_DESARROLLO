import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useInventory } from '../contexts/InventoryContext';

const InventoryScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const { products, totalProducts, searchProducts, filterByEstado, deleteProduct } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'ID' | 'Producto' | 'Estado'>('Todos');
  const [estadoFilter, setEstadoFilter] = useState<'Todos' | 'Stock alto' | 'Stock medio' | 'Stock bajo' | 'Sin stock'>('Todos');

  const filteredProducts = useMemo(() => {
    if (searchQuery) return searchProducts(searchQuery);
    if (estadoFilter !== 'Todos') return filterByEstado(estadoFilter);
    return products;
  }, [products, searchQuery, estadoFilter, searchProducts, filterByEstado]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Stock alto':
        return '#4CAF50';
      case 'Stock medio':
        return '#FFA726';
      case 'Stock bajo':
        return '#FF5722';
      case 'Sin stock':
        return '#9E9E9E';
      default:
        return '#FFA726';
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteProduct(id) },
      ]
    );
  };

  const renderRow = ({ item }: any) => {
    if (isCompact) {
      // Tarjeta para pantallas chicas
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>{item.id}</Text>
            </View>
            <Text style={styles.productName} numberOfLines={1}>
              {item.nombre}
            </Text>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Eliminar producto"
              accessibilityRole="button"
            >
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <View style={[styles.statusBadge, { backgroundColor: toRGBA(getEstadoColor(item.estado), 0.15) }]}>
              <Text style={[styles.statusText, { color: getEstadoColor(item.estado) }]} numberOfLines={1}>
                ⚠ {item.estado}
              </Text>
            </View>

            <View style={styles.qtyPill}>
              <Text style={styles.qtyLabel}>Cantidad</Text>
              <Text style={styles.qtyValue}>{item.cantidad}</Text>
            </View>
          </View>
        </View>
      );
    }

    // Fila “tabla” para pantallas medianas/grandes
    return (
      <View style={styles.productRow}>
        <View style={styles.idCell}>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>{item.id}</Text>
          </View>
        </View>

        <View style={styles.nameCell}>
          <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
        </View>

        <View style={styles.statusCell}>
          <View style={[styles.statusBadge, { backgroundColor: toRGBA(getEstadoColor(item.estado), 0.15) }]}>
            <Text style={[styles.statusText, { color: getEstadoColor(item.estado) }]} numberOfLines={1}>
              ⚠ {item.estado}
            </Text>
          </View>
        </View>

        <View style={styles.quantityCell}>
          <Text style={styles.quantity}>{item.cantidad}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Eliminar producto"
          accessibilityRole="button"
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventario de Stock</Text>

        <View style={styles.headerRight}>
          <View style={styles.totalBadge}>
            <Text style={styles.totalLabel}>Total productos</Text>
            <Text style={styles.totalNumber}>{totalProducts}</Text>
          </View>

          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportText}>📄 Exportar PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>{filteredProducts.length} productos encontrados</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o ID del producto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'ID' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('ID')}
          >
            <Text style={[styles.filterText, selectedFilter === 'ID' && styles.filterTextActive]}>ID ↓</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'Producto' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('Producto')}
          >
            <Text style={[styles.filterText, selectedFilter === 'Producto' && styles.filterTextActive]}>Producto ↓</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'Estado' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('Estado')}
          >
            <Text style={[styles.filterText, selectedFilter === 'Estado' && styles.filterTextActive]}>Estado ↓</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rangeRow}>
          <Text style={styles.rangeLabel}>Cantidad</Text>
          <View style={styles.rangeInputs}>
            <TextInput style={styles.rangeInput} placeholder="Min" keyboardType="numeric" />
            <Text style={styles.rangeSeparator}>—</Text>
            <TextInput style={styles.rangeInput} placeholder="Máx" keyboardType="numeric" />
          </View>
        </View>
      </View>

      {/* Encabezado tabla (solo cuando no es compacto) */}
      {!isCompact && (
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCellId]}>ID</Text>
          <Text style={[styles.headerCellName]}>Producto</Text>
          <Text style={[styles.headerCellStatus]}>Estado</Text>
          <Text style={[styles.headerCellQuantity]}>Cantidad</Text>
        </View>
      )}

      {/* Lista */}
      <FlatList
        data={filteredProducts}
        renderItem={renderRow}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]} // para que no tape el FAB
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
        accessibilityLabel="Agregar producto"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Utilidad: hex a rgba con alpha
const toRGBA = (hex: string, alpha = 1) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#5B5FE3' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  totalBadge: { alignItems: 'center', marginRight: 10 },
  totalLabel: { fontSize: 12, color: '#666' },
  totalNumber: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  exportButton: { backgroundColor: '#FFA726', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  exportText: { color: '#FFFFFF', fontWeight: '600' },

  subtitle: { paddingHorizontal: 16, paddingTop: 6, backgroundColor: '#FFFFFF' },
  subtitleText: { fontSize: 13, color: '#666' },

  searchContainer: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  searchInput: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 8, fontSize: 14 },

  // Filtros
  filtersContainer: { backgroundColor: '#5B5FE3', paddingHorizontal: 12, paddingVertical: 12 },
  filtersRow: { flexDirection: 'row' },
  filterButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 },
  filterButtonActive: { backgroundColor: '#FFFFFF' },
  filterText: { color: '#FFFFFF', fontWeight: '600' },
  filterTextActive: { color: '#5B5FE3' },

  rangeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' },
  rangeLabel: { color: '#FFFFFF', fontWeight: '600', marginRight: 10 },
  rangeInputs: { flexDirection: 'row', alignItems: 'center' },
  rangeInput: { backgroundColor: '#FFFFFF', width: 70, padding: 8, borderRadius: 6, textAlign: 'center' },
  rangeSeparator: { color: '#FFFFFF', marginHorizontal: 8 },

  // Header de tabla
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  headerCellId: { flexBasis: 56, flexGrow: 0, fontWeight: '600', color: '#666' },
  headerCellName: { flex: 1, fontWeight: '600', color: '#666' },
  headerCellStatus: { flexBasis: 140, flexGrow: 0, fontWeight: '600', color: '#666' },
  headerCellQuantity: { flexBasis: 80, flexGrow: 0, fontWeight: '600', color: '#666', textAlign: 'center' },

  listContent: { backgroundColor: '#FFFFFF' },

  // Fila tipo tabla
  productRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  idCell: { flexBasis: 56, flexGrow: 0 },
  idBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#5B5FE3', justifyContent: 'center', alignItems: 'center',
  },
  idText: { color: '#FFFFFF', fontWeight: 'bold' },

  nameCell: { flex: 1, paddingRight: 8 },
  productName: { fontSize: 14, color: '#333' },

  statusCell: { flexBasis: 140, flexGrow: 0, paddingRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '600' },

  quantityCell: { flexBasis: 80, flexGrow: 0, alignItems: 'center' },
  quantity: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  deleteButton: { padding: 8, marginLeft: 6 },
  deleteText: { fontSize: 18 },

  // Tarjeta compacta
  card: {
    marginHorizontal: 12, marginTop: 10,
    borderRadius: 12, backgroundColor: '#FFFFFF',
    padding: 12, borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardBody: { flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' },

  qtyPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F5F7FA' },
  qtyLabel: { fontSize: 12, color: '#666', marginRight: 6 },
  qtyValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  // FAB
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#5B5FE3', justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  fabText: { fontSize: 30, color: '#FFFFFF', fontWeight: '300' },
});

export default InventoryScreen;
