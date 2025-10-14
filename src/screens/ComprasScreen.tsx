import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ComprasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍️ Compras</Text>
      <Text>Aquí puedes ver y gestionar las compras realizadas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
