// src/screens/ProductFormScreen.tsx
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  getProduct,
  createProduct,
  updateProduct,
  getCategories,
  getBrands,
  getUnits,
  uploadProductImage,
  clearProductImage,
  type ProductPayload,
} from '../services/products';

// Si deseas selector nativo, descomenta e instala:
// npx expo install expo-image-picker
// import * as ImagePicker from 'expo-image-picker';

type Catalog = { id: number; name: string };
type Unit = { id: number; code: string; name: string };

type State = {
  isEdit: boolean;
  submitting: boolean;
  error: string;

  categories: Catalog[];
  brands: Catalog[];
  units: Unit[];

  sku: string;
  name: string;
  categoryId?: number;
  brandId?: number;
  unitId?: number;
  barcode?: string;
  description?: string;
  costPrice: string;
  salePrice: string;
  isTaxable: boolean;
  minStock: string;

  currentImageUrl: string | null;
  newImage: { uri: string; name?: string; type?: string } | null;
  pastedUrl: string;
};

export default class ProductFormScreen extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    const id = Number(this.props.route?.params?.id);
    this.state = {
      isEdit: !!id,
      submitting: false,
      error: '',

      categories: [],
      brands: [],
      units: [],

      sku: '',
      name: '',
      categoryId: undefined,
      brandId: undefined,
      unitId: undefined,
      barcode: '',
      description: '',
      costPrice: '',
      salePrice: '',
      isTaxable: true,
      minStock: '0',

      currentImageUrl: null,
      newImage: null,
      pastedUrl: '',
    };
  }

  async componentDidMount() {
    await this.loadLookups();
    if (this.state.isEdit) await this.loadIfEdit();
  }

  async loadLookups() {
    try { this.setState({ categories: await getCategories() }); } catch {}
    try { this.setState({ brands: await getBrands() }); } catch {}
    try { this.setState({ units: await getUnits() }); } catch {}
  }

  async loadIfEdit() {
    try {
      const id = Number(this.props.route?.params?.id);
      const p = await getProduct(id);
      this.setState({
        sku: p.sku || '',
        name: p.name || '',
        categoryId: (p as any).category_id ?? (p as any).categoryId,
        brandId: (p as any).brand_id ?? (p as any).brandId,
        unitId: (p as any).unit_id ?? (p as any).unitId,
        barcode: (p as any).barcode || '',
        description: (p as any).description || '',
        costPrice: String((p as any).cost_price ?? (p as any).costPrice ?? ''),
        salePrice: String((p as any).sale_price ?? (p as any).salePrice ?? ''),
        isTaxable: !!((p as any).is_taxable ?? (p as any).isTaxable ?? true),
        minStock: String((p as any).min_stock ?? (p as any).minStock ?? 0),
        currentImageUrl: (p as any).image_url ?? null,
      });
    } catch (e: any) {
      this.setState({ error: e?.response?.data?.message || 'No se pudo cargar el producto' });
    }
  }

  // ▼ Imagen
  setImageFromUrl = () => {
    const url = this.state.pastedUrl.trim();
    if (url) {
      this.setState({ newImage: { uri: url }, currentImageUrl: null, pastedUrl: '' });
    }
  };

  // pickImage = async () => {
  //   const res = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     quality: 0.85,
  //   });
  //   if (!res.canceled && res.assets?.length) {
  //     const a = res.assets[0];
  //     this.setState({
  //       newImage: { uri: a.uri, name: a.fileName || 'image.jpg', type: a.mimeType || 'image/jpeg' },
  //       currentImageUrl: null,
  //     });
  //   }
  // };

  removeCurrentImage = async () => {
    try {
      if (!this.state.isEdit) {
        this.setState({ newImage: null, currentImageUrl: null });
        return;
      }
      const id = Number(this.props.route?.params?.id);
      await clearProductImage(id);
      this.setState({ currentImageUrl: null });
    } catch (e: any) {
      this.setState({ error: e?.response?.data?.message || 'No se pudo quitar la imagen' });
    }
  };

  resetForm = () => {
    if (!this.state.isEdit) {
      this.setState({
        sku: '',
        name: '',
        categoryId: undefined,
        brandId: undefined,
        unitId: undefined,
        barcode: '',
        description: '',
        costPrice: '',
        salePrice: '',
        isTaxable: true,
        minStock: '0',
        newImage: null,
        pastedUrl: '',
        currentImageUrl: null,
      });
    }
  };

  async submit() {
    const { sku, name, unitId, costPrice, salePrice } = this.state;
    if (!sku || !name || !unitId || costPrice === '' || salePrice === '') {
      this.setState({ error: 'Completa los campos obligatorios.' });
      return;
    }

    this.setState({ submitting: true, error: '' });
    try {
      const payload: ProductPayload = {
        sku: this.state.sku,
        name: this.state.name,
        categoryId: this.state.categoryId,
        brandId: this.state.brandId,
        unitId: Number(this.state.unitId),
        barcode: this.state.barcode || undefined,
        description: this.state.description || undefined,
        costPrice: Number(this.state.costPrice),
        salePrice: Number(this.state.salePrice),
        isTaxable: !!this.state.isTaxable,
        minStock: Number(this.state.minStock),
      };

      if (this.state.isEdit) {
        const id = Number(this.props.route?.params?.id);
        await updateProduct(id, payload);
        if (this.state.newImage) {
          await uploadProductImage(id, this.state.newImage);
        }
      } else {
        const created = await createProduct(payload);
        const id = (created as any)?.product_id ?? (created as any)?.id;
        if (this.state.newImage && id) {
          await uploadProductImage(id, this.state.newImage);
        }
      }

      this.props.navigation.goBack();
    } catch (e: any) {
      this.setState({ error: e?.response?.data?.message || e?.message || 'No se pudo guardar' });
    } finally {
      this.setState({ submitting: false });
    }
  }

  render() {
    const {
      isEdit, submitting, error,
      categories, brands, units,
      sku, name, categoryId, brandId, unitId, barcode, description, costPrice, salePrice, isTaxable, minStock,
      currentImageUrl, newImage, pastedUrl,
    } = this.state;

    const behavior = Platform.OS === 'ios' ? 'padding' : undefined;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={behavior}>
          <ScrollView contentContainerStyle={stf.wrap} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={stf.header}>
              <Text style={stf.h1}>{isEdit ? 'Editar producto' : 'Nuevo producto'}</Text>
            </View>

            {/* Form 1-columna, mobile-first */}
            <View style={stf.card}>
              <Field label="SKU *">
                <TextInput value={sku} onChangeText={(t) => this.setState({ sku: t })} placeholder="SKU…" style={stf.input} />
              </Field>

              <Field label="Nombre *">
                <TextInput value={name} onChangeText={(t) => this.setState({ name: t })} placeholder="Nombre del producto" style={stf.input} />
              </Field>

              <Field label="Categoría">
                <Chips
                  value={categoryId}
                  onChange={(v) => this.setState({ categoryId: v })}
                  options={[{ id: undefined as any, name: '— Sin categoría —' }, ...categories]}
                />
              </Field>

              <Field label="Marca">
                <Chips
                  value={brandId}
                  onChange={(v) => this.setState({ brandId: v })}
                  options={[{ id: undefined as any, name: '— Sin marca —' }, ...brands]}
                />
              </Field>

              <Field label="Unidad *">
                <Chips
                  value={unitId}
                  onChange={(v) => this.setState({ unitId: v })}
                  options={units.map((u) => ({ id: u.id, name: `${u.code} — ${u.name}` }))}
                />
              </Field>

              <Field label="Código de barras">
                <TextInput value={barcode} onChangeText={(t) => this.setState({ barcode: t })} placeholder="Opcional" style={stf.input} />
              </Field>

              <Field label="Precio costo (Q) *">
                <TextInput value={costPrice} onChangeText={(t) => this.setState({ costPrice: t })} keyboardType="decimal-pad" placeholder="0.00" style={stf.input} />
              </Field>

              <Field label="Precio venta (Q) *">
                <TextInput value={salePrice} onChangeText={(t) => this.setState({ salePrice: t })} keyboardType="decimal-pad" placeholder="0.00" style={stf.input} />
              </Field>

              <Field label="Mínimo en stock">
                <TextInput value={minStock} onChangeText={(t) => this.setState({ minStock: t })} keyboardType="number-pad" placeholder="0" style={stf.input} />
              </Field>

              <Field label="Afecto a IVA">
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#111827' }}>Sí</Text>
                  <Switch value={isTaxable} onValueChange={(v) => this.setState({ isTaxable: v })} />
                </View>
              </Field>

              {/* Imagen mobile-friendly */}
              <Field label="Imagen del producto">
                <View style={{ gap: 10 }}>
                  <TextInput
                    value={pastedUrl}
                    onChangeText={(t) => this.setState({ pastedUrl: t })}
                    placeholder="Pega una URL de imagen (opcional)"
                    style={stf.input}
                    autoCapitalize="none"
                  />
                  <Pressable disabled={!pastedUrl.trim()} onPress={this.setImageFromUrl} style={[stf.btn, stf.btnGhost, !pastedUrl.trim() && stf.disabled]}>
                    <Text style={stf.btnGhostText}>Usar URL</Text>
                  </Pressable>

                  {/* Selector nativo (opcional) */}
                  {/* <Pressable onPress={this.pickImage} style={[stf.btn, stf.btnGhost]}>
                    <Text style={stf.btnGhostText}>Seleccionar de la galería</Text>
                  </Pressable> */}

                  {newImage?.uri ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Image source={{ uri: newImage.uri }} style={stf.preview} />
                      <Pressable onPress={() => this.setState({ newImage: null })}><Text style={{ color: '#111827' }}>Quitar nueva</Text></Pressable>
                    </View>
                  ) : currentImageUrl ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Image source={{ uri: currentImageUrl }} style={stf.preview} />
                      <Pressable onPress={this.removeCurrentImage}><Text style={{ color: '#b91c1c' }}>Quitar imagen actual</Text></Pressable>
                    </View>
                  ) : null}
                </View>
              </Field>

              <Field label="Descripción">
                <TextInput
                  value={description}
                  onChangeText={(t) => this.setState({ description: t })}
                  placeholder="Describe el producto…"
                  multiline
                  style={[stf.input, { height: 120, textAlignVertical: 'top' }]}
                />
                <Text style={{ alignSelf: 'flex-end', color: '#6b7280', marginTop: 4 }}>{(description?.length || 0)}/500</Text>
              </Field>

              {!!error && <Text style={{ color: '#b91c1c' }}>{error}</Text>}
            </View>

            {/* Acciones grandes y espaciadas */}
            <View style={stf.footer}>
              <Pressable onPress={() => this.props.navigation.goBack()}><Text style={{ color: '#374151' }}>⬅️ Volver</Text></Pressable>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={this.resetForm} style={[stf.btn, stf.btnGhost]}>
                  <Text style={stf.btnGhostText}>Limpiar</Text>
                </Pressable>
                <Pressable
                  disabled={submitting}
                  onPress={() => this.submit()}
                  style={[stf.btn, stf.btnPrimary, submitting && stf.disabled]}
                >
                  <Text style={stf.btnPrimaryText}>{submitting ? 'Guardando…' : (isEdit ? 'Actualizar' : 'Crear')}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

// ——— helpers UI (etiquetas y chips táctiles) ———
class Field extends React.PureComponent<{ label: string; children: React.ReactNode }> {
  render() {
    return (
      <View style={{ gap: 6 }}>
        <Text style={stf.label}>{this.props.label}</Text>
        {this.props.children}
      </View>
    );
  }
}

class Chips extends React.PureComponent<{
  value?: number;
  onChange: (v: number | undefined) => void;
  options: { id: number | undefined; name: string }[];
}> {
  render() {
    const { value, onChange, options } = this.props;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const active = value === o.id;
          return (
            <Pressable key={String(o.id) + o.name} onPress={() => onChange(o.id)} style={[stf.chip, active && stf.chipActive]}>
              <Text numberOfLines={1} style={[stf.chipText, active && stf.chipTextActive]}>{o.name}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
}

const stf = StyleSheet.create({
  wrap: { padding: 12, gap: 12 },
  header: { paddingHorizontal: 4, paddingTop: 4, paddingBottom: 0 },
  h1: { fontSize: 22, fontWeight: '800', color: '#0f172a' },

  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, gap: 14 },
  label: { color: '#374151', fontWeight: '700' },
  input: { height: 48, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, backgroundColor: 'white' },

  chip: { paddingVertical: Platform.OS === 'ios' ? 8 : 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#cbd5e1' },
  chipActive: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  chipText: { color: '#0f172a' },
  chipTextActive: { color: '#3730a3', fontWeight: '800' },

  preview: { width: 96, height: 96, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },

  footer: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  btn: { height: 48, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnPrimaryText: { color: 'white', fontWeight: '800' },
  btnGhost: { borderColor: '#e5e7eb', backgroundColor: 'white' },
  btnGhostText: { color: '#111827', fontWeight: '700' },
  disabled: { opacity: 0.7 },
});
