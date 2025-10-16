// src/screens/PurchaseScreen.tsx
import React from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { createPurchase, receivePurchase, getStock, type StockItem } from '../services/purchases';
import PurchaseItemRow from '../components/PurchaseItemRow';

type Row = { productId: number; qty: number; unitCost: number };
type MsgType = 'success' | 'error';

type State = {
  supplierId: string;        // como string para TextInput
  invoiceNumber: string;
  purchaseDate: string;      // 'YYYY-MM-DD'
  items: Row[];
  products: StockItem[];
  createdId: number | null;

  msg: string;
  msgType: MsgType;

  loadingStock: boolean;
  submitting: boolean;
  receiving: boolean;

  userId?: number;           // opcional, para receive
};

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default class PurchaseScreen extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      supplierId: '1',
      invoiceNumber: '',
      purchaseDate: todayISODate(),
      items: [{ productId: 0, qty: 1, unitCost: 0 }],
      products: [],
      createdId: null,
      msg: '',
      msgType: 'success',
      loadingStock: false,
      submitting: false,
      receiving: false,
      userId: Number(this.props.route?.params?.userId) || 1, // si lo pasas desde navigator
    };
  }

  async componentDidMount() {
    this.setState({ loadingStock: true });
    try {
      const products = await getStock();
      this.setState({ products });
    } catch {
      Alert.alert('Error', 'No se pudo cargar el stock');
    } finally {
      this.setState({ loadingStock: false });
    }
  }

  addRow = () => this.setState((s) => ({ items: [...s.items, { productId: 0, qty: 1, unitCost: 0 }] }));
  removeRow = (i: number) => this.setState((s) => ({ items: s.items.filter((_, idx) => idx !== i) }));
  updateRow = (i: number, key: 'productId' | 'qty' | 'unitCost', val: number) =>
    this.setState((s) => {
      const arr = [...s.items];
      (arr[i] as any)[key] = Number(val);
      return { items: arr };
    });

  getProductName = (id: number) => {
    const p = this.state.products.find(x => x.productId === id);
    return p ? p.name : 'Producto no encontrado';
  };

  calcTotalItems(): number {
    return this.state.items.reduce((sum, r) => sum + Number(r.qty || 0), 0);
    }
  calcTotalCost(): number {
    return this.state.items.reduce((sum, r) => sum + Number(r.qty || 0) * Number(r.unitCost || 0), 0);
  }

  async submit() {
    const supplierId = Number(this.state.supplierId || 0);
    if (!supplierId) {
      this.setState({ msg: '❌ Error: Proveedor inválido', msgType: 'error' });
      return;
    }
    const cleanItems = this.state.items.filter(i => i.productId > 0 && i.qty > 0);
    if (!cleanItems.length) {
      this.setState({ msg: '❌ Error: agrega al menos un producto', msgType: 'error' });
      return;
    }

    this.setState({ submitting: true, msg: '' });
    try {
      const payload = {
        supplierId,
        invoiceNumber: this.state.invoiceNumber || undefined,
        purchaseDate: this.state.purchaseDate,
        items: cleanItems,
      };
      const res = await createPurchase(payload);
      this.setState({
        createdId: res.purchaseId,
        msg: `✅ Compra creada exitosamente #${res.purchaseId} (${res.status})`,
        msgType: 'success',
      });
    } catch (e: any) {
      this.setState({ msg: `❌ Error: ${e?.message || 'No se pudo guardar'}`, msgType: 'error' });
    } finally {
      this.setState({ submitting: false });
    }
  }

  async doReceive() {
    if (!this.state.createdId) return;
    this.setState({ receiving: true, msg: '' });
    try {
      const res = await receivePurchase(this.state.createdId, this.state.userId);
      this.setState({
        msg: `✅ Compra recibida #${res.purchaseId} - Subtotal: Q${res.subtotal.toLocaleString()}, IVA: Q${res.tax.toLocaleString()}`,
        msgType: 'success',
      });
    } catch (e: any) {
      this.setState({ msg: `❌ Error: ${e?.message || 'No se pudo recibir'}`, msgType: 'error' });
    } finally {
      this.setState({ receiving: false });
    }
  }

  render() {
    const behavior = Platform.OS === 'ios' ? 'padding' : undefined;
    const totalItems = this.calcTotalItems();
    const totalCost = this.calcTotalCost();

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={behavior}>
          <ScrollView contentContainerStyle={st.wrap} keyboardShouldPersistTaps="handled">
            {/* Header + stats */}
            <View style={st.header}>
              <View>
                <Text style={st.h1}>🛒 Gestión de Compras</Text>
                <Text style={st.hSub}>Registra y administra las compras a proveedores</Text>
              </View>
              <View style={st.statsRow}>
                <View style={st.statCard}>
                  <Text style={st.statLabel}>Items totales</Text>
                  <Text style={st.statValue}>{totalItems}</Text>
                </View>
                <View style={st.statCard}>
                  <Text style={st.statLabel}>Costo total</Text>
                  <Text style={[st.statValue, { color: '#16a34a' }]}>Q{totalCost.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Mensaje */}
            {!!this.state.msg && (
              <View style={[
                st.msg,
                this.state.msgType === 'success' ? st.msgSuccess : st.msgError
              ]}>
                <Text style={this.state.msgType === 'success' ? st.msgTextSuccess : st.msgTextError}>
                  {this.state.msg}
                </Text>
              </View>
            )}

            {/* Card: info compra */}
            <View style={st.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 22 }}>📋</Text>
                <Text style={st.cardTitle}>Información de la compra</Text>
              </View>

              <View style={{ gap: 12 }}>
                <View>
                  <Text style={st.label}>🏢 Proveedor ID *</Text>
                  <TextInput
                    value={this.state.supplierId}
                    onChangeText={(t) => this.setState({ supplierId: t })}
                    keyboardType="number-pad"
                    placeholder="Ingrese ID del proveedor"
                    style={st.input}
                  />
                </View>

                <View>
                  <Text style={st.label}>📄 Número de factura *</Text>
                  <TextInput
                    value={this.state.invoiceNumber}
                    onChangeText={(t) => this.setState({ invoiceNumber: t })}
                    placeholder="Ej: FAC-001"
                    style={st.input}
                  />
                </View>

                <View>
                  <Text style={st.label}>📅 Fecha de compra *</Text>
                  <TextInput
                    value={this.state.purchaseDate}
                    onChangeText={(t) => this.setState({ purchaseDate: t })}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                    style={st.input}
                  />
                  {/* Si quieres, integra @react-native-community/datetimepicker aquí */}
                </View>
              </View>
            </View>

            {/* Card: items */}
            <View style={st.card}>
              <View style={st.cardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 22, color: 'white' }}>📦</Text>
                  <Text style={st.cardHeaderTitle}>Productos de la compra</Text>
                </View>
                <Pressable onPress={this.addRow} style={st.btnHeader}>
                  <Text style={st.btnHeaderText}>➕ Agregar producto</Text>
                </Pressable>
              </View>

              {this.state.loadingStock ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator />
                </View>
              ) : this.state.items.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 40 }}>📦</Text>
                  <Text style={{ fontWeight: '700', color: '#111827' }}>No hay productos</Text>
                  <Text style={{ color: '#64748b' }}>Agrega productos a tu compra</Text>
                  <Pressable onPress={this.addRow} style={[st.btn, st.btnPrimary]}>
                    <Text style={st.btnPrimaryText}>➕ Agregar Primer Producto</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {this.state.items.map((r, i) => (
                    <PurchaseItemRow
                      key={i}
                      index={i}
                      row={r}
                      products={this.state.products}
                      getProductName={this.getProductName}
                      onChange={this.updateRow}
                      onRemove={this.removeRow}
                    />
                  ))}
                </View>
              )}

              {/* Totales al pie */}
              <View style={st.totals}>
                <Text style={st.totalsLabel}>TOTAL:</Text>
                <Text style={st.totalsValue}>Q{totalCost.toFixed(2)}</Text>
              </View>
            </View>

            {/* Acciones */}
            <View style={st.actions}>
              <Pressable
                onPress={() => this.submit()}
                disabled={this.state.submitting}
                style={[st.btn, st.btnPrimary, this.state.submitting && st.disabled]}
              >
                <Text style={st.btnPrimaryText}>{this.state.submitting ? 'Guardando…' : '💾 Guardar Compra'}</Text>
              </Pressable>

              <Pressable
                onPress={() => this.doReceive()}
                disabled={!this.state.createdId || this.state.receiving}
                style={[
                  st.btn, st.btnAlt,
                  (!this.state.createdId || this.state.receiving) && st.disabled
                ]}
              >
                <Text style={st.btnAltText}>{this.state.receiving ? 'Recibiendo…' : '✅ Recibir Compra'}</Text>
              </Pressable>
            </View>

            {/* Info de compra creada */}
            {!!this.state.createdId && (
              <View style={st.infoCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 28 }}>✅</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>Compra creada</Text>
                </View>
                <View style={{ gap: 6 }}>
                  <Text><Text style={{ fontWeight: '700' }}>ID de Compra:</Text> #{this.state.createdId}</Text>
                  <Text><Text style={{ fontWeight: '700' }}>Factura:</Text> {this.state.invoiceNumber || '—'}</Text>
                  <Text><Text style={{ fontWeight: '700' }}>Fecha:</Text> {this.state.purchaseDate}</Text>
                  <Text><Text style={{ fontWeight: '700' }}>Proveedor:</Text> #{this.state.supplierId}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const st = StyleSheet.create({
  wrap: { padding: 12, gap: 12 },
  header: { gap: 12 },
  h1: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  hSub: { color: '#475569' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 14 },
  statLabel: { color: '#4b5563', fontWeight: '600' },
  statValue: { color: '#111827', fontSize: 20, fontWeight: '800' },

  msg: { borderRadius: 12, borderWidth: 2, padding: 12 },
  msgSuccess: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  msgError: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  msgTextSuccess: { color: '#166534', fontWeight: '700' },
  msgTextError: { color: '#991b1b', fontWeight: '700' },

  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  cardHeaderRow: { backgroundColor: '#16a34a', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderTitle: { color: 'white', fontWeight: '800', fontSize: 16 },
  btnHeader: { backgroundColor: 'white', paddingHorizontal: 12, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnHeaderText: { color: '#16a34a', fontWeight: '800' },

  label: { color: '#374151', fontWeight: '700', marginBottom: 6 },
  input: { height: 48, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: 'white' },

  totals: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalsLabel: { fontWeight: '800', color: '#334155' },
  totalsValue: { fontWeight: '800', fontSize: 22, color: '#0ea5e9' },

  actions: { flexDirection: 'column', gap: 8 },
  btn: { height: 48, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnPrimaryText: { color: 'white', fontWeight: '800' },
  btnAlt: { backgroundColor: '#7c3aed', borderColor: '#c4b5fd' },
  btnAltText: { color: 'white', fontWeight: '800' },
  disabled: { opacity: 0.6 },

  infoCard: { backgroundColor: '#dcfce7', borderWidth: 2, borderColor: '#86efac', padding: 12, borderRadius: 12 },
});
