import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useInventory } from '../contexts/InventoryContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
  const { totalProducts, products } = useInventory();

  // Calcular estadísticas
  const stockBajo = products.filter(p => p.estado === 'Stock bajo').length;
  const stockMedio = products.filter(p => p.estado === 'Stock medio').length;
  const stockAlto = products.filter(p => p.estado === 'Stock alto').length;
  const sinStock = products.filter(p => p.estado === 'Sin stock').length;

  const menuItems = [
    {
      id: 1,
      title: 'Inventario',
      icon: '📦',
      description: 'Gestiona tu stock',
      gradient: ['#667eea', '#764ba2'],
      screen: 'Inventory',
      count: totalProducts,
    },
    {
      id: 2,
      title: 'Productos',
      icon: '🛍️',
      description: 'Catálogo de productos',
      gradient: ['#f093fb', '#f5576c'],
      screen: 'Products',
    },
    {
      id: 3,
      title: 'Compras',
      icon: '🧾',
      description: 'Historial de compras',
      gradient: ['#4facfe', '#00f2fe'],
      screen: 'Compras',
    },
    {
      id: 4,
      title: 'Reportería',
      icon: '📈',
      description: 'Análisis y reportes',
      gradient: ['#43e97b', '#38f9d7'],
      screen: 'Reporteria',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏠 Dashboard</Text>
        <Text style={styles.subtitle}>Resumen general de tu negocio</Text>
      </View>

      {/* Estadísticas de Inventario */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Estado del Inventario</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.statNumber}>{stockAlto}</Text>
            <Text style={styles.statLabel}>Stock Alto</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FFA726' }]}>
            <Text style={styles.statNumber}>{stockMedio}</Text>
            <Text style={styles.statLabel}>Stock Medio</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FF5722' }]}>
            <Text style={styles.statNumber}>{stockBajo}</Text>
            <Text style={styles.statLabel}>Stock Bajo</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#9E9E9E' }]}>
            <Text style={styles.statNumber}>{sinStock}</Text>
            <Text style={styles.statLabel}>Sin Stock</Text>
          </View>
        </View>
      </View>

      {/* Menú de navegación */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Módulos</Text>
        
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.gradient}
                style={styles.menuGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
                {item.count !== undefined && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.count}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Alertas */}
      {(stockBajo > 0 || sinStock > 0) && (
        <View style={styles.alertContainer}>
          <Text style={styles.sectionTitle}>⚠️ Alertas</Text>
          
          {stockBajo > 0 && (
            <View style={[styles.alertCard, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Stock Bajo</Text>
                <Text style={styles.alertText}>
                  {stockBajo} producto{stockBajo !== 1 ? 's' : ''} con stock bajo
                </Text>
              </View>
            </View>
          )}
          
          {sinStock > 0 && (
            <View style={[styles.alertCard, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.alertIcon}>🚨</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Sin Stock</Text>
                <Text style={styles.alertText}>
                  {sinStock} producto{sinStock !== 1 ? 's' : ''} sin stock disponible
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: (width - 50) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuContainer: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  menuCard: {
    width: (width - 55) / 2,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  menuDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  alertContainer: {
    padding: 20,
    paddingTop: 0,
  },
  alertCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  alertText: {
    fontSize: 14,
    color: '#666',
  },
});