import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ModernCard() {
  return (
    <View style={styles.card}>
      {/* Header con ícono y título */}
      <View style={styles.header}>
        <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.iconContainer}>
          <Text style={styles.icon}>🔩</Text>
        </LinearGradient>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Tornillo Feliz</Text>
          <Text style={styles.subtitle}>La mejor ferretería de Guatemala</Text>
        </View>
      </View>

      {/* Llamada a la acción */}
      <Pressable style={({ pressed }) => [styles.actionContainer, pressed && { opacity: 0.85 }]}>
        <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.actionGradient}>
          <Ionicons name="flash" size={18} color="white" style={{ marginRight: 6 }} />
          <Text style={styles.actionText}>Ofertas especiales disponibles</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
