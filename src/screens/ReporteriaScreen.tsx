import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReporteriaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Reportería</Text>
      <Text>Aquí podrás generar reportes de ventas, compras, etc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
