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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
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

      fadeAnim: new Animated.Value(0),
      scaleAnim: new Animated.Value(0.9),
    };
  }

  async componentDidMount() {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(this.state.scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

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

  setImageFromUrl = () => {
    const url = this.state.pastedUrl.trim();
    if (url) {
      this.setState({ newImage: { uri: url }, currentImageUrl: null, pastedUrl: '' });
    }
  };

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
      fadeAnim, scaleAnim,
    } = this.state;

    const behavior = Platform.OS === 'ios' ? 'padding' : undefined;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <LinearGradient
          colors={['#1e293b', '#0f172a', '#020617']}
          style={{ flex: 1 }}
        >
          {/* Header con gradiente */}
          <View style={stf.header}>
            <Pressable onPress={() => this.props.navigation.goBack()} style={stf.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={stf.headerTitle}>{isEdit ? '✏️ Editar' : '✨ Nuevo'}</Text>
              <Text style={stf.headerSubtitle}>Producto</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={behavior}>
            <Animated.ScrollView
              contentContainerStyle={stf.wrap}
              keyboardShouldPersistTaps="handled"
              style={{ opacity: fadeAnim }}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                {/* Tarjeta glassmorphic */}
                <View style={stf.glassCard}>
                  <Field label="SKU" required icon="barcode-outline">
                    <TextInput
                      value={sku}
                      onChangeText={(t) => this.setState({ sku: t })}
                      placeholder="Código único..."
                      placeholderTextColor="#94a3b8"
                      style={stf.input}
                    />
                  </Field>

                  <Field label="Nombre del producto" required icon="pricetag">
                    <TextInput
                      value={name}
                      onChangeText={(t) => this.setState({ name: t })}
                      placeholder="Ej: Laptop Dell XPS 13"
                      placeholderTextColor="#94a3b8"
                      style={stf.input}
                    />
                  </Field>

                  <Field label="Categoría" icon="albums-outline">
                    <Chips
                      value={categoryId}
                      onChange={(v) => this.setState({ categoryId: v })}
                      options={[{ id: undefined as any, name: '— Sin categoría —' }, ...categories]}
                    />
                  </Field>

                  <Field label="Marca" icon="ribbon-outline">
                    <Chips
                      value={brandId}
                      onChange={(v) => this.setState({ brandId: v })}
                      options={[{ id: undefined as any, name: '— Sin marca —' }, ...brands]}
                    />
                  </Field>

                  <Field label="Unidad de medida" required icon="cube-outline">
                    <Chips
                      value={unitId}
                      onChange={(v) => this.setState({ unitId: v })}
                      options={units.map((u) => ({ id: u.id, name: `${u.code} — ${u.name}` }))}
                    />
                  </Field>

                  <Field label="Código de barras" icon="scan-outline">
                    <TextInput
                      value={barcode}
                      onChangeText={(t) => this.setState({ barcode: t })}
                      placeholder="Opcional"
                      placeholderTextColor="#94a3b8"
                      style={stf.input}
                    />
                  </Field>

                  {/* Precios en columnas */}
                  <View style={stf.priceRow}>
                    <View style={{ flex: 1 }}>
                      <Field label="Costo (Q)" required icon="cash-outline">
                        <TextInput
                          value={costPrice}
                          onChangeText={(t) => this.setState({ costPrice: t })}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor="#94a3b8"
                          style={stf.input}
                        />
                      </Field>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field label="Venta (Q)" required icon="cart-outline">
                        <TextInput
                          value={salePrice}
                          onChangeText={(t) => this.setState({ salePrice: t })}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor="#94a3b8"
                          style={stf.input}
                        />
                      </Field>
                    </View>
                  </View>

                  <Field label="Stock mínimo" icon="layers-outline">
                    <TextInput
                      value={minStock}
                      onChangeText={(t) => this.setState({ minStock: t })}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      style={stf.input}
                    />
                  </Field>

                  <Field label="Afecto a IVA" icon="receipt-outline">
                    <View style={stf.switchRow}>
                      <Text style={stf.switchLabel}>
                        {isTaxable ? '✅ Sí, aplica IVA' : '❌ No aplica IVA'}
                      </Text>
                      <Switch
                        value={isTaxable}
                        onValueChange={(v) => this.setState({ isTaxable: v })}
                        trackColor={{ false: '#334155', true: '#3b82f6' }}
                        thumbColor={isTaxable ? '#60a5fa' : '#94a3b8'}
                      />
                    </View>
                  </Field>

                  {/* Imagen con preview más grande */}
                  <Field label="Imagen del producto" icon="image-outline">
                    <View style={{ gap: 12 }}>
                      <View style={stf.inputWithIcon}>
                        <Ionicons name="link-outline" size={20} color="#94a3b8" style={{ marginLeft: 12 }} />
                        <TextInput
                          value={pastedUrl}
                          onChangeText={(t) => this.setState({ pastedUrl: t })}
                          placeholder="Pega URL de imagen..."
                          placeholderTextColor="#94a3b8"
                          style={[stf.input, { flex: 1, marginLeft: 8 }]}
                          autoCapitalize="none"
                        />
                      </View>
                      
                      <Pressable
                        disabled={!pastedUrl.trim()}
                        onPress={this.setImageFromUrl}
                        style={[stf.btnSecondary, !pastedUrl.trim() && stf.disabled]}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={stf.btnSecondaryText}>Usar esta URL</Text>
                      </Pressable>

                      {newImage?.uri ? (
                        <View style={stf.imagePreviewContainer}>
                          <Image source={{ uri: newImage.uri }} style={stf.previewLarge} />
                          <View style={stf.imageOverlay}>
                            <Pressable
                              onPress={() => this.setState({ newImage: null })}
                              style={stf.removeImageBtn}
                            >
                              <Ionicons name="close-circle" size={24} color="#fff" />
                              <Text style={stf.removeImageText}>Quitar</Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : currentImageUrl ? (
                        <View style={stf.imagePreviewContainer}>
                          <Image source={{ uri: currentImageUrl }} style={stf.previewLarge} />
                          <View style={stf.imageOverlay}>
                            <Pressable
                              onPress={this.removeCurrentImage}
                              style={stf.removeImageBtn}
                            >
                              <Ionicons name="trash" size={24} color="#fff" />
                              <Text style={stf.removeImageText}>Eliminar</Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <View style={stf.emptyImage}>
                          <Ionicons name="image-outline" size={48} color="#475569" />
                          <Text style={stf.emptyImageText}>Sin imagen</Text>
                        </View>
                      )}
                    </View>
                  </Field>

                  <Field label="Descripción" icon="document-text-outline">
                    <TextInput
                      value={description}
                      onChangeText={(t) => this.setState({ description: t })}
                      placeholder="Describe las características del producto..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      style={[stf.input, stf.textArea]}
                    />
                    <Text style={stf.charCount}>{(description?.length || 0)}/500</Text>
                  </Field>

                  {!!error && (
                    <View style={stf.errorBox}>
                      <Ionicons name="alert-circle" size={20} color="#fca5a5" />
                      <Text style={stf.errorText}>{error}</Text>
                    </View>
                  )}
                </View>

                {/* Botones flotantes */}
                <View style={stf.actions}>
                  <Pressable onPress={this.resetForm} style={stf.btnOutline}>
                    <Ionicons name="refresh" size={20} color="#94a3b8" />
                    <Text style={stf.btnOutlineText}>Limpiar</Text>
                  </Pressable>

                  <Pressable
                    disabled={submitting}
                    onPress={() => this.submit()}
                    style={[stf.btnPrimary, submitting && stf.disabled]}
                  >
                    <LinearGradient
                      colors={submitting ? ['#64748b', '#475569'] : ['#3b82f6', '#2563eb', '#1d4ed8']}
                      style={stf.btnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name={submitting ? 'hourglass' : (isEdit ? 'checkmark-circle' : 'add-circle')}
                        size={22}
                        color="#fff"
                      />
                      <Text style={stf.btnPrimaryText}>
                        {submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Producto')}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </Animated.View>
            </Animated.ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

// ───── Componentes UI ─────
class Field extends React.PureComponent<{
  label: string;
  required?: boolean;
  icon?: any;
  children: React.ReactNode;
}> {
  render() {
    return (
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {this.props.icon && <Ionicons name={this.props.icon} size={18} color="#94a3b8" />}
          <Text style={stf.label}>
            {this.props.label}
            {this.props.required && <Text style={{ color: '#f87171' }}> *</Text>}
          </Text>
        </View>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {options.map((o) => {
          const active = value === o.id;
          return (
            <Pressable
              key={String(o.id) + o.name}
              onPress={() => onChange(o.id)}
              style={[stf.chip, active && stf.chipActive]}
            >
              <Text numberOfLines={1} style={[stf.chipText, active && stf.chipTextActive]}>
                {o.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }
}

const stf = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 100 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: -4,
  },

  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  label: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  input: {
    height: 52,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: '#fff',
    fontSize: 16,
  },

  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    height: 52,
  },

  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  chipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: '#3b82f6',
  },
  chipText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#60a5fa',
    fontWeight: '800',
  },

  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  switchLabel: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 15,
  },

  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewLarge: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  removeImageText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  emptyImage: {
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyImageText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },

  charCount: {
    alignSelf: 'flex-end',
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.3)',
  },
  errorText: {
    color: '#fca5a5',
    flex: 1,
    fontWeight: '600',
  },

  actions: {
    marginTop: 20,
    gap: 12,
  },

  btnPrimary: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  btnSecondaryText: {
    color: '#60a5fa',
    fontWeight: '700',
    fontSize: 14,
  },

  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  btnOutlineText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 15,
  },

  disabled: {
    opacity: 0.5,
  },
});