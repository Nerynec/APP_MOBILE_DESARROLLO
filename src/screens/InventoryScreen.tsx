import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useInventory } from '../contexts/InventoryContext';

const InventoryScreen = ({ navigation }: any) => {
  const { products, totalProducts, searchProducts, filterByEstado, deleteProduct } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'ID' | 'Producto' | 'Estado'>('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  const filteredProducts = searchQuery 
    ? searchProducts(searchQuery)
    : estadoFilter !== 'Todos'
    ? filterByEstado(estadoFilter)
    : products;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Stock alto':
        return '#10b981';
      case 'Stock medio':
        return '#f59e0b';
      case 'Stock bajo':
        return '#ef4444';
      case 'Sin stock':
        return '#6b7280';
      default:
        return '#f59e0b';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Stock alto':
        return '✅';
      case 'Stock medio':
        return '⚠️';
      case 'Stock bajo':
        return '🔴';
      case 'Sin stock':
        return '❌';
      default:
        return '⚠️';
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteProduct(id) }
      ]
    );
  };

  const renderProduct = ({ item, index }: any) => (
    <Animated.View style={[styles.productCard, { opacity: 1 }]}>
      <View style={styles.productHeader}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>#{item.id}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityLabel}>Stock:</Text>
            <Text style={styles.quantityValue}>{item.cantidad}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.productFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) + '15', borderColor: getEstadoColor(item.estado) }]}>
          <Text style={styles.statusIcon}>{getEstadoIcon(item.estado)}</Text>
          <Text style={[styles.statusText, { color: getEstadoColor(item.estado) }]}>
            {item.estado}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.deleteGradient}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>📦 Inventario</Text>
            <Text style={styles.subtitle}>{filteredProducts.length} productos</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.totalBadge}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalNumber}>{totalProducts}</Text>
            </View>
            <TouchableOpacity style={styles.exportButton}>
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.exportGradient}
              >
                <Text style={styles.exportText}>📄 PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar producto..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'Todos' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('Todos')}
          >
            <Text style={[styles.filterText, selectedFilter === 'Todos' && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'ID' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('ID')}
          >
            <Text style={[styles.filterText, selectedFilter === 'ID' && styles.filterTextActive]}>
              ID ↓
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'Producto' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('Producto')}
          >
            <Text style={[styles.filterText, selectedFilter === 'Producto' && styles.filterTextActive]}>
              A-Z
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'Estado' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('Estado')}
          >
            <Text style={[styles.filterText, selectedFilter === 'Estado' && styles.filterTextActive]}>
              Estado
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB con gradiente */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.fabGradient}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  totalLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginTop: 2,
  },
  exportButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exportGradient: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  exportText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  filterTextActive: {
    color: '#667eea',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  idBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  idText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#667eea',
    letterSpacing: -0.5,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  quantityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  quantityLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginRight: 6,
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1e293b',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    gap: 6,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  deleteIcon: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});

export default InventoryScreen;