import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { usePurchase, PurchaseItem } from '../contexts/PurchaseContext';
import { useInventory } from '../contexts/InventoryContext';

export default function ComprasScreen({ navigation }: any) {
  const {
    currentPurchase,
    setCurrentPurchase,
    addItemToCurrentPurchase,
    removeItemFromCurrentPurchase,
    updateItemInCurrentPurchase,
    savePurchase,
    getCurrentPurchaseTotal,
  } = usePurchase();

  const { products } = useInventory();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const handleAddProduct = () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Selecciona un producto');
      return;
    }

    const product = products.find((p) => p.id.toString() === selectedProduct);
    if (!product) return;

    const newItem: PurchaseItem = {
      productId: product.id.toString(),
      productName: product.nombre,
      quantity: 10,
      unitCost: 25,
      subtotal: 250,
    };

    addItemToCurrentPurchase(newItem);
    setSelectedProduct('');
    setShowProductDropdown(false);
  };

  const handleSavePurchase = () => {
    if (!currentPurchase.invoiceNumber) {
      Alert.alert('Error', 'El número de factura es requerido');
      return;
    }

    if (currentPurchase.items.length === 0) {
      Alert.alert('Error', 'Agrega al menos un producto');
      return;
    }

    try {
      savePurchase();
      Alert.alert('Éxito', 'Compra guardada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleReceivePurchase = () => {
    Alert.alert(
      'Recibir Compra',
      '¿Deseas marcar esta compra como recibida y actualizar el inventario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            handleSavePurchase();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🛒</Text>
            <View>
              <Text style={styles.title}>Gestión de Compras</Text>
              <Text style={styles.subtitle}>
                Registra y administra las compras a proveedores
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ítems totales</Text>
              <Text style={styles.statValue}>{currentPurchase.items.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Costo total</Text>
              <Text style={styles.statValue}>
                Q{getCurrentPurchaseTotal().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Purchase Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Información de la Compra</Text>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                📁 Proveedor ID <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={currentPurchase.providerId}
                onChangeText={(text) =>
                  setCurrentPurchase({ ...currentPurchase, providerId: text })
                }
                placeholder="1"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                📄 Número de Factura <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={currentPurchase.invoiceNumber}
                onChangeText={(text) =>
                  setCurrentPurchase({ ...currentPurchase, invoiceNumber: text })
                }
                placeholder="Ej: FAC-001"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                📅 Fecha de Compra <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={currentPurchase.purchaseDate}
                onChangeText={(text) =>
                  setCurrentPurchase({ ...currentPurchase, purchaseDate: text })
                }
                placeholder="15/10/2025"
              />
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View style={[styles.section, styles.productsSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📦</Text>
            <Text style={styles.sectionTitle}>Productos de la Compra</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowProductDropdown(!showProductDropdown)}
            >
              <Text style={styles.addButtonText}>+ Agregar Producto</Text>
            </TouchableOpacity>
          </View>

          {/* Product Dropdown */}
          {showProductDropdown && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Seleccionar Producto:</Text>
              <ScrollView style={styles.dropdown} nestedScrollEnabled>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.dropdownItem,
                      selectedProduct === product.id.toString() &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => setSelectedProduct(product.id.toString())}
                  >
                    <Text style={styles.dropdownItemText}>
                      {product.nombre} (Stock: {product.cantidad})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAddProduct}>
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Table Header */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.productCol]}>PRODUCTO</Text>
              <Text style={[styles.tableHeaderCell, styles.quantityCol]}>CANTIDAD</Text>
              <Text style={[styles.tableHeaderCell, styles.costCol]}>
                COSTO UNITARIO (Q)
              </Text>
              <Text style={[styles.tableHeaderCell, styles.subtotalCol]}>
                SUBTOTAL (Q)
              </Text>
              <Text style={[styles.tableHeaderCell, styles.actionsCol]}>ACCIONES</Text>
            </View>

            {/* Table Rows */}
            {currentPurchase.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.productCol]}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <Text style={styles.stockInfo}>(Stock: 38)</Text>
                </View>

                <View style={[styles.tableCell, styles.quantityCol]}>
                  <TextInput
                    style={styles.quantityInput}
                    value={item.quantity.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      updateItemInCurrentPurchase(index, {
                        quantity: parseInt(text) || 0,
                      })
                    }
                  />
                </View>

                <View style={[styles.tableCell, styles.costCol]}>
                  <TextInput
                    style={styles.costInput}
                    value={item.unitCost.toString()}
                    keyboardType="decimal-pad"
                    onChangeText={(text) =>
                      updateItemInCurrentPurchase(index, {
                        unitCost: parseFloat(text) || 0,
                      })
                    }
                  />
                </View>

                <View style={[styles.tableCell, styles.subtotalCol]}>
                  <Text style={styles.subtotalText}>Q{item.subtotal.toFixed(2)}</Text>
                </View>

                <View style={[styles.tableCell, styles.actionsCol]}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeItemFromCurrentPurchase(index)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>
              Q{getCurrentPurchaseTotal().toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSavePurchase}
          >
            <Text style={styles.actionButtonText}>💾 Guardar Compra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.receiveButton]}
            onPress={handleReceivePurchase}
          >
            <Text style={styles.actionButtonText}>✅ Recibir Compra</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productsSection: {
    background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formGrid: {
    gap: 15,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: '#e11d48',
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  dropdownContainer: {
    backgroundColor: '#F5F7FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  dropdownItemText: {
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  tableCell: {
    justifyContent: 'center',
  },
  productCol: {
    flex: 2,
  },
  quantityCol: {
    flex: 1,
  },
  costCol: {
    flex: 1,
  },
  subtotalCol: {
    flex: 1,
  },
  actionsCol: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
  },
  stockInfo: {
    fontSize: 12,
    color: '#666',
  },
  quantityInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
  },
  costInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
  },
  deleteIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  deleteText: {
    fontSize: 12,
    color: '#e11d48',
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    padding: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0D9488',
  },
  receiveButton: {
    backgroundColor: '#D946EF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});