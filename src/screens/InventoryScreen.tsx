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
} from 'react-native';
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
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteProduct(id) }
      ]
    );
  };

  const renderProduct = ({ item }: any) => (
    <View style={styles.productRow}>
      <View style={styles.idCell}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{item.id}</Text>
        </View>
      </View>
      
      <View style={styles.nameCell}>
        <Text style={styles.productName}>{item.nombre}</Text>
      </View>
      
      <View style={styles.statusCell}>
        <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
          <Text style={[styles.statusText, { color: getEstadoColor(item.estado) }]}>
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
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o ID del producto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'ID' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('ID')}
        >
          <Text style={[styles.filterText, selectedFilter === 'ID' && styles.filterTextActive]}>
            ID ↓
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'Producto' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('Producto')}
        >
          <Text style={[styles.filterText, selectedFilter === 'Producto' && styles.filterTextActive]}>
            Producto ↓
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'Estado' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('Estado')}
        >
          <Text style={[styles.filterText, selectedFilter === 'Estado' && styles.filterTextActive]}>
            Estado ↓
          </Text>
        </TouchableOpacity>

        <View style={styles.rangeContainer}>
          <Text style={styles.rangeLabel}>Cantidad</Text>
          <View style={styles.rangeInputs}>
            <TextInput style={styles.rangeInput} placeholder="Min" />
            <Text style={styles.rangeSeparator}>—</Text>
            <TextInput style={styles.rangeInput} placeholder="Máx" />
          </View>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCellId}>ID</Text>
        <Text style={styles.headerCellName}>Producto</Text>
        <Text style={styles.headerCellStatus}>Estado</Text>
        <Text style={styles.headerCellQuantity}>Cantidad</Text>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5B5FE3',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  totalBadge: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtitle: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#5B5FE3',
    gap: 10,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#5B5FE3',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 10,
  },
  rangeLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rangeInput: {
    backgroundColor: '#FFFFFF',
    width: 60,
    padding: 6,
    borderRadius: 4,
    textAlign: 'center',
  },
  rangeSeparator: {
    color: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCellId: {
    width: 60,
    fontWeight: '600',
    color: '#666',
  },
  headerCellName: {
    flex: 1,
    fontWeight: '600',
    color: '#666',
  },
  headerCellStatus: {
    width: 150,
    fontWeight: '600',
    color: '#666',
  },
  headerCellQuantity: {
    width: 80,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    backgroundColor: '#FFFFFF',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  idCell: {
    width: 60,
  },
  idBadge: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#5B5FE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  nameCell: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#333',
  },
  statusCell: {
    width: 150,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quantityCell: {
    width: 80,
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 10,
  },
  deleteText: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5B5FE3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default InventoryScreen;