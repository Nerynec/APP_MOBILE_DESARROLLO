// src/components/ProductPickerModal.tsx
import React from 'react';
import {
  Modal, View, Text, TextInput, FlatList, Pressable, StyleSheet,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import type { StockItem } from '../services/purchases';

type Props = {
  visible: boolean;
  products: StockItem[];
  onClose: () => void;
  onSelect: (p: StockItem) => void;
};

type State = { q: string };

export default class ProductPickerModal extends React.PureComponent<Props, State> {
  state: State = { q: '' };

  filter(): StockItem[] {
    const q = this.state.q.trim().toLowerCase();
    if (!q) return this.props.products;
    return this.props.products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      String(p.productId).includes(q)
    );
  }

  renderItem = ({ item }: { item: StockItem }) => (
    <Pressable style={s.item} onPress={() => this.props.onSelect(item)}>
      <Text style={s.itemTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={s.itemMeta}>ID: {item.productId} • Stock: {item.stock}</Text>
    </Pressable>
  );

  render() {
    const data = this.filter();
    return (
      <Modal visible={this.props.visible} transparent animationType="slide" onRequestClose={this.props.onClose}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={s.backdrop}>
            <View style={s.card}>
              <View style={s.header}>
                <Text style={s.title}>Selecciona un producto</Text>
                <Pressable onPress={this.props.onClose}><Text style={s.close}>✕</Text></Pressable>
              </View>

              <View style={s.body}>
                <TextInput
                  placeholder="Buscar por nombre o ID…"
                  style={s.input}
                  onChangeText={(q) => this.setState({ q })}
                />
                <FlatList
                  data={data}
                  keyExtractor={(x) => String(x.productId)}
                  renderItem={this.renderItem}
                  contentContainerStyle={{ paddingBottom: 8 }}
                  ListEmptyComponent={<Text style={s.empty}>Sin resultados</Text>}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'flex-end' },
  card: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '92%' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  close: { fontSize: 18 },
  body: { padding: 12, gap: 8 },
  input: { height: 44, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: 'white', marginBottom: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  itemTitle: { fontWeight: '700', color: '#0f172a' },
  itemMeta: { color: '#64748b', marginTop: 2 },
  empty: { color: '#64748b', paddingVertical: 16, textAlign: 'center' },
});
