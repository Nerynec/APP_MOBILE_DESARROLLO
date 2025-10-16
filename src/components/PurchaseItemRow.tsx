// src/components/PurchaseItemRow.tsx
import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import type { StockItem } from '../services/purchases';
import ProductPickerModal from './ProductPickerModal';

type Row = { productId: number; qty: number; unitCost: number };
type Props = {
  index: number;
  row: Row;
  products: StockItem[];
  getProductName: (id: number) => string;
  onChange: (i: number, key: 'productId' | 'qty' | 'unitCost', val: number) => void;
  onRemove: (i: number) => void;
};
type State = { showPicker: boolean };

export default class PurchaseItemRow extends React.PureComponent<Props, State> {
  state: State = { showPicker: false };

  openPicker = () => this.setState({ showPicker: true });
  closePicker = () => this.setState({ showPicker: false });

  onSelect = (p: StockItem) => {
    const { index, onChange } = this.props;
    onChange(index, 'productId', p.productId);
    this.closePicker();
  };

  render() {
    const { index, row, getProductName, onChange, onRemove, products } = this.props;
    const subtotal = Number(row.qty || 0) * Number(row.unitCost || 0);

    return (
      <View style={st.card}>
        {/* Producto */}
        <Text style={st.label}>Producto</Text>
        <Pressable onPress={this.openPicker} style={st.select}>
          <Text style={st.selectText}>
            {row.productId > 0 ? `${getProductName(row.productId)} (ID ${row.productId})` : 'Seleccionar producto…'}
          </Text>
        </Pressable>

        {/* Cantidad y Costo */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Cantidad</Text>
            <TextInput
              defaultValue={String(row.qty ?? '')}
              onChangeText={(t) => onChange(index, 'qty', Number(t || 0))}
              keyboardType="number-pad"
              placeholder="0"
              style={st.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Costo unitario (Q)</Text>
            <TextInput
              defaultValue={String(row.unitCost ?? '')}
              onChangeText={(t) => onChange(index, 'unitCost', Number(t || 0))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={st.input}
            />
          </View>
        </View>

        {/* Subtotal + acciones */}
        <View style={st.footer}>
          <Text style={st.subtotal}>Subtotal: Q{subtotal.toFixed(2)}</Text>
          <Pressable onPress={() => onRemove(index)} style={[st.btn, st.btnDanger]}>
            <Text style={st.btnDangerText}>🗑️ Eliminar</Text>
          </Pressable>
        </View>

        {/* Modal selector */}
        <ProductPickerModal
          visible={this.state.showPicker}
          products={products}
          onClose={this.closePicker}
          onSelect={this.onSelect}
        />
      </View>
    );
  }
}

const st = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, gap: 10 },
  label: { color: '#374151', fontWeight: '700' },
  input: { height: 44, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: 'white' },
  select: { height: 44, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: 'white', justifyContent: 'center' },
  selectText: { color: '#0f172a' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotal: { fontWeight: '800', color: '#111827' },
  btn: { height: 40, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnDanger: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
  btnDangerText: { color: '#b91c1c', fontWeight: '800' },
});
