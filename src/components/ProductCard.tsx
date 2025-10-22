import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { UiProduct } from '../models/product';

type Props = {
  product: UiProduct;               // 👈 UiProduct (de DB)
  onAdd: (p: UiProduct) => void;    // el padre decide cómo mapear
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
};

const n = (x: any, d = 0) => {
  const v = Number(x);
  return Number.isFinite(v) ? v : d;
};
const placeholder = 'https://via.placeholder.com/300x300.png?text=Producto';

export default function ProductCard({ product, onAdd, onEdit, onDelete, isAdmin }: Props) {
  const price = n(product?.price, 0);
  const img = product?.imageUrl ? String(product.imageUrl) : placeholder;

  return (
    <View style={styles.card}>
      <Image source={{ uri: img }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{product?.name ?? 'Producto'}</Text>
        <Text style={styles.price}>Q {price.toFixed(2)}</Text>

        {isAdmin ? (
          <View style={styles.adminActions}>
            <Pressable onPress={onEdit} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="pencil" size={20} color="#2563eb" />
            </Pressable>
            <Pressable onPress={onDelete} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => onAdd(product)} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}>
            <LinearGradient colors={['#34d399', '#059669']} style={styles.buttonGradient}>
              <Ionicons name="add-circle-outline" size={18} color="white" />
              <Text style={styles.buttonText}>Agregar</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  image: { width: 90, height: 90, borderRadius: 12, marginRight: 12, backgroundColor: '#eee' },
  info: { flex: 1 },
  name: { fontWeight: '700', fontSize: 16, color: '#111827', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#059669', marginBottom: 8 },
  button: { alignSelf: 'flex-start', borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700', marginLeft: 6, fontSize: 14 },
  adminActions: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
});
