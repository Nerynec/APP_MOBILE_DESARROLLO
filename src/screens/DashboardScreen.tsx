import React from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { format, startOfDay, startOfMonth, startOfYear, addDays, subMilliseconds } from 'date-fns';
import { getDashboard, type DashboardResp } from '../services/admin';
import { toCSV } from '../utils/csv';
import { saveAndShareText } from '../utils/share';
import { VictoryChart, VictoryArea, VictoryBar, VictoryPie, VictoryAxis, VictoryTheme, VictoryLabel } from '../vendor/Charts';

const N = (v: unknown): number => (v == null || v === '' ? 0 : Number(v));
const money = (v?: unknown) => N(v).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' });
const num = (v?: unknown) => N(v).toLocaleString('es-GT');
const pct = (curr: number, prev: number) => (prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100);
const trendIcon  = (v: number) => (v > 0 ? '▲' : v < 0 ? '▼' : '—');
const trendColor = (v: number) => (v > 0 ? '#059669' : v < 0 ? '#dc2626' : '#6b7280');

function toDatetimeLocal(d: Date) {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

type PresetKey = 'today'|'7d'|'30d'|'mtd'|'ytd';

type State = {
  from: string;
  to: string;
  data: DashboardResp | null;
  prev: DashboardResp | null;
  loading: boolean;
  err: string;
  prodQuery: string;
  prodSortKey: 'revenue'|'units'|'product_name';
  prodSortDir: 'asc'|'desc';
};

export default class DashboardScreen extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      from: toDatetimeLocal(new Date(Date.now() - 30 * 24 * 3600 * 1000)),
      to: toDatetimeLocal(new Date()),
      data: null, prev: null, loading: false, err: '',
      prodQuery: '', prodSortKey: 'revenue', prodSortDir: 'desc',
    };
  }
  componentDidMount(): void { this.load(); }

  async load() {
    this.setState({ loading: true, err: '' });
    try {
      const fromISO = new Date(this.state.from).toISOString();
      const toISO = new Date(this.state.to).toISOString();
      const data = await getDashboard(fromISO, toISO);

      // periodo anterior:
      const fromD = new Date(this.state.from);
      const toD = new Date(this.state.to);
      const duration = toD.getTime() - fromD.getTime();
      const prevTo = subMilliseconds(fromD, 1);
      const prevFrom = new Date(prevTo.getTime() - duration);
      const prev = await getDashboard(prevFrom.toISOString(), prevTo.toISOString());

      this.setState({ data, prev });
    } catch (e: any) {
      this.setState({ err: e?.message || 'Error cargando datos' });
    } finally {
      this.setState({ loading: false });
    }
  }

  applyPreset(p: PresetKey) {
    const now = new Date();
    if (p === 'today') { this.setState({ from: toDatetimeLocal(startOfDay(now)), to: toDatetimeLocal(now) }, () => this.load()); return; }
    if (p === '7d')  { this.setState({ from: toDatetimeLocal(addDays(now, -7)),  to: toDatetimeLocal(now) }, () => this.load()); return; }
    if (p === '30d') { this.setState({ from: toDatetimeLocal(addDays(now, -30)), to: toDatetimeLocal(now) }, () => this.load()); return; }
    if (p === 'mtd') { this.setState({ from: toDatetimeLocal(startOfMonth(now)),  to: toDatetimeLocal(now) }, () => this.load()); return; }
    if (p === 'ytd') { this.setState({ from: toDatetimeLocal(startOfYear(now)),   to: toDatetimeLocal(now) }, () => this.load()); return; }
  }

  filteredTopProducts() {
    const d = this.state.data;
    if (!d) return [];
    const q = this.state.prodQuery.trim().toLowerCase();
    let arr = d.topProducts.filter(p => !q || p.product_name.toLowerCase().includes(q));
    const k = this.state.prodSortKey;
    const dir = this.state.prodSortDir === 'asc' ? 1 : -1;
    arr = arr.slice().sort((a: any, b: any) => {
      const av = a[k], bv = b[k];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return arr;
  }

  toggleProdSort(k: 'revenue'|'units'|'product_name') {
    if (this.state.prodSortKey === k) {
      this.setState({ prodSortDir: this.state.prodSortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      this.setState({ prodSortKey: k, prodSortDir: 'desc' });
    }
  }

  exportAllCSVs = async () => {
    const d = this.state.data;
    if (!d) return;
    const stamp = format(new Date(), 'yyyyMMdd_HHmm');

    try {
      // resumen
      if (d.summary) {
        await saveAndShareText(`resumen_${stamp}.csv`, toCSV([{
          pedidos: d.summary.orders, ingresos: d.summary.revenue, ventas_brutas: d.summary.gross_sales,
          descuentos: d.summary.discounts, impuestos: d.summary.taxes, aov: d.summary.avg_order_value,
        }]));
      }
      // daily
      if (d.daily?.length) {
        await saveAndShareText(`ingresos_diarios_${stamp}.csv`, toCSV(d.daily.map(x => ({ fecha: x.day, ingresos: x.revenue }))));
      }
      // top
      if (d.topProducts?.length) {
        await saveAndShareText(`top_productos_${stamp}.csv`, toCSV(d.topProducts.map(t => ({
          id: t.product_id, producto: t.product_name, unidades: t.units, ingresos: t.revenue,
        }))));
      }
      // por pago (usa payment_method_name / code)
      if (d.byPayment?.length) {
        await saveAndShareText(`por_pago_${stamp}.csv`, toCSV(d.byPayment.map(p => ({
          codigo: p.payment_method_code, metodo: p.payment_method_name, pedidos: p.orders, ingresos: p.revenue,
        }))));
      }
      // por canal
      if (d.byChannel?.length) {
        await saveAndShareText(`por_canal_${stamp}.csv`, toCSV(d.byChannel.map(c => ({
          canal: c.channel, pedidos: c.orders, ingresos: c.revenue,
        }))));
      }
      // por categoría (extra que tienes en web)
      if (d.byCategory?.length) {
        await saveAndShareText(`por_categoria_${stamp}.csv`, toCSV(d.byCategory.map(c => ({
          id: c.category_id ?? '', categoria: c.category_name ?? '', ingresos: c.revenue,
        }))));
      }
    } catch (e: any) {
      Alert.alert('Exportación', e?.message || 'No se pudieron compartir los CSV');
    }
  };

  renderKpi(title: string, value: string, curr: number, prev?: number) {
    const showTrend = typeof prev === 'number';
    const p = showTrend ? pct(curr, prev!) : 0;
    return (
      <View style={st.kpi}>
        <Text style={st.kpiIcon}>{title}</Text>
        <Text style={st.kpiValue}>{value}</Text>
        {showTrend && (
          <Text style={{ color: trendColor(p), fontWeight: '700' }}>
            {p > 0 ? '▲' : p < 0 ? '▼' : '—'} {p.toFixed(1)}% <Text style={{ color: '#6b7280', fontWeight: '400' }}>vs anterior</Text>
          </Text>
        )}
      </View>
    );
  }

  render() {
    const { data, prev, loading, err } = this.state;
    const s = data?.summary, ps = prev?.summary;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
        <ScrollView contentContainerStyle={st.wrap}>
          {/* Header */}
          <View style={st.header}>
            <View>
              <Text style={st.h1}>Dashboard de Ventas</Text>
              <Text style={st.hSub}>
                📊 Rango: {format(new Date(this.state.from), 'dd MMM yyyy')} → {format(new Date(this.state.to), 'dd MMM yyyy')}
              </Text>
            </View>

            {/* Presets */}
            <View style={st.presetRow}>
              {(['today','7d','30d','mtd','ytd'] as PresetKey[]).map((p) => (
                <Pressable key={p} style={st.chip} onPress={() => this.applyPreset(p)}>
                  <Text style={st.chipText}>
                    {p === 'today' ? 'Hoy' : p === '7d' ? 'Últimos 7d' : p === '30d' ? 'Últimos 30d' : p === 'mtd' ? 'Mes actual' : 'Año actual'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Fechas y acciones */}
            <View style={st.dateRow}>
              <TextInput value={this.state.from} onChangeText={(t)=>this.setState({from:t})} placeholder="YYYY-MM-DDTHH:mm" style={st.dateInput}/>
              <TextInput value={this.state.to}   onChangeText={(t)=>this.setState({to:t})}   placeholder="YYYY-MM-DDTHH:mm" style={st.dateInput}/>
              <Pressable onPress={() => this.load()} disabled={loading} style={[st.btn, st.btnPrimary, loading && st.disabled]}>
                <Text style={st.btnPrimaryText}>{loading ? '⏳ Cargando…' : '🔄 Actualizar'}</Text>
              </Pressable>
              <Pressable onPress={this.exportAllCSVs} style={[st.btn, st.btnGhost]}>
                <Text style={st.btnGhostText}>⬇️ Exportar CSV</Text>
              </Pressable>
            </View>
          </View>

          {!!err && <View style={st.error}><Text style={{ color: '#b91c1c' }}>⚠️ {err}</Text></View>}

          {/* KPIs */}
          {s ? (
            <View style={st.kpiRow}>
              {this.renderKpi('💰 Ingresos', money(s.revenue), s.revenue, ps?.revenue)}
              {this.renderKpi('📦 Pedidos', num(s.orders), s.orders, ps?.orders)}
              {this.renderKpi('💳 AOV', money(s.avg_order_value), s.avg_order_value, ps?.avg_order_value)}
              {this.renderKpi('🏷️ Descuentos', money(s.discounts), s.discounts /* tendencia opcional */)}
              {this.renderKpi('🧾 Impuestos', money(s.taxes), s.taxes)}
            </View>
          ) : (<View style={{ padding: 12 }}><ActivityIndicator /></View>)}

          {/* Área: ingresos por día */}
          {(data?.daily?.length || 0) > 0 && (
            <View style={st.card}>
              <Text style={st.cardTitle}>📈 Ingresos por día</Text>
              <VictoryChart theme={VictoryTheme.material} height={260} padding={{ top: 12, left: 56, right: 12, bottom: 40 }}>
                <VictoryAxis tickFormat={(t) => String(t).slice(5)} style={{ tickLabels: { fontSize: 10, fill: '#64748b' }, axis: { stroke: '#e5e7eb' }, grid: { stroke: '#e5e7eb' } }}/>
                <VictoryAxis dependentAxis tickFormat={(v)=>`Q${Math.round(Number(v))}`} style={{ tickLabels: { fontSize: 10, fill: '#64748b' }, axis: { stroke: '#e5e7eb' }, grid: { stroke: '#e5e7eb' } }}/>
                <VictoryArea interpolation="natural" style={{ data: { fill: 'rgba(16,185,129,0.25)', stroke: '#10b981', strokeWidth: 3 } }}
                  data={data!.daily.map(d => ({ x: d.day, y: d.revenue }))}/>
              </VictoryChart>
            </View>
          )}

          {/* Barras: top productos */}
          {(data?.topProducts?.length || 0) > 0 && (
            <View style={st.card}>
              <Text style={st.cardTitle}>🏆 Top productos por ingresos</Text>
              <VictoryChart height={300} domainPadding={{ x: 18 }} padding={{ top: 12, left: 56, right: 12, bottom: 90 }}>
                <VictoryAxis
                  tickLabelComponent={<VictoryLabel angle={-45} dy={-2} />}
                  style={{ tickLabels: { fontSize: 9, fill: '#64748b' }, axis: { stroke: '#e5e7eb' }, grid: { stroke: '#f1f5f9' } }}
                  tickValues={data!.topProducts.map((_, i) => i + 1)}
                  tickFormat={data!.topProducts.map(t => t.product_name)}
                />
                <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10, fill: '#64748b' }, grid: { stroke: '#e5e7eb' } }}/>
                <VictoryBar cornerRadius={{ top: 6 }} style={{ data: { fill: '#3b82f6' } }}
                  data={data!.topProducts.map((t, i) => ({ x: i + 1, y: t.revenue }))}/>
              </VictoryChart>

              {/* Tabla compacta */}
              <View style={st.tableToolbar}>
                <TextInput value={this.state.prodQuery} onChangeText={(t)=>this.setState({prodQuery:t})} placeholder="Buscar producto…" style={st.search}/>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable onPress={()=>this.toggleProdSort('revenue')} style={st.pill}><Text style={st.pillText}>Ingresos</Text></Pressable>
                  <Pressable onPress={()=>this.toggleProdSort('units')}   style={st.pill}><Text style={st.pillText}>Unidades</Text></Pressable>
                  <Pressable onPress={()=>this.toggleProdSort('product_name')} style={st.pill}><Text style={st.pillText}>Nombre</Text></Pressable>
                </View>
              </View>
              {this.filteredTopProducts().slice(0,50).map((p)=>(
                <View key={p.product_id} style={st.row}>
                  <Text style={[st.cell,{flex:1}]} numberOfLines={1}>#{p.product_id}</Text>
                  <Text style={[st.cell,{flex:4}]} numberOfLines={1}>{p.product_name}</Text>
                  <Text style={[st.cell,{flex:2,textAlign:'right'}]}>{num(p.units)}</Text>
                  <Text style={[st.cell,{flex:3,textAlign:'right',fontWeight:'700'}]}>{money(p.revenue)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Donut: por método de pago */}
          {(data?.byPayment?.length || 0) > 0 && (
            <View style={st.card}>
              <Text style={st.cardTitle}>💳 Mezcla por método de pago</Text>
              <VictoryPie
                height={300} innerRadius={60} padAngle={2}
                colorScale={['#06b6d4','#8b5cf6','#ec4899','#f59e0b','#10b981']}
                labels={({ datum }) => `${datum.x}\n${money(datum.y)}`}
                style={{ labels: { fontSize: 10, fill: '#334155' } }}
                data={data!.byPayment.map(p => ({ x: p.payment_method_name, y: p.revenue }))}
              />
            </View>
          )}

          {/* Barras: por canal */}
          {(data?.byChannel?.length || 0) > 0 && (
            <View style={st.card}>
              <Text style={st.cardTitle}>📱 Ventas por canal</Text>
              <VictoryChart height={280} domainPadding={{ x: 24 }} padding={{ top: 12, left: 56, right: 12, bottom: 56 }}>
                <VictoryAxis
                  style={{ tickLabels: { fontSize: 11, fill: '#64748b' }, axis: { stroke: '#e5e7eb' } }}
                  tickValues={data!.byChannel.map((_, i) => i + 1)}
                  tickFormat={data!.byChannel.map(c => c.channel)}
                />
                <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10, fill: '#64748b' }, grid: { stroke: '#e5e7eb' } }}/>
                <VictoryBar cornerRadius={{ top: 6 }} style={{ data: { fill: '#0ea5e9' } }}
                  data={data!.byChannel.map((c, i) => ({ x: i + 1, y: c.revenue }))}/>
              </VictoryChart>
            </View>
          )}

          {/* Barras: por hora */}
          {(data?.byHour?.length || 0) > 0 && (
            <View style={st.card}>
              <Text style={st.cardTitle}>⏰ Actividad por hora</Text>
              <VictoryChart height={240} domainPadding={{ x: 8 }} padding={{ top: 12, left: 56, right: 12, bottom: 40 }}>
                <VictoryAxis
                  tickValues={data!.byHour.map(h => h.hour_of_day)}
                  tickFormat={data!.byHour.map(h => `${h.hour_of_day}:00`)}
                  style={{ tickLabels: { fontSize: 10, fill: '#64748b' }, axis: { stroke: '#e5e7eb' } }}
                />
                <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10, fill: '#64748b' }, grid: { stroke: '#e5e7eb' } }}/>
                <VictoryBar cornerRadius={{ top: 4 }} style={{ data: { fill: '#8b5cf6' } }}
                  data={data!.byHour.map(h => ({ x: h.hour_of_day, y: h.orders }))}/>
              </VictoryChart>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const st = StyleSheet.create({
  wrap: { padding: 12, gap: 12 },
  header: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, gap: 12 },
  h1: { fontSize: 22, fontWeight: '800', color: '#111827' },
  hSub: { color: '#475569' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  chipText: { color: '#4338ca', fontWeight: '700' },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  dateInput: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 12, backgroundColor: 'white', flexGrow: 1, minWidth: 180 },
  btn: { height: 44, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#3b82f6' },
  btnPrimaryText: { color: 'white', fontWeight: '800' },
  btnGhost: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1' },
  btnGhostText: { color: '#111827', fontWeight: '700' },
  disabled: { opacity: 0.6 },
  error: { padding: 12, borderRadius: 12, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },

  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: { flexGrow: 1, minWidth: 150, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, gap: 4 },
  kpiIcon: { fontSize: 22 },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },

  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },

  tableToolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 8 },
  search: { flexGrow: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 12, backgroundColor: 'white' },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: '#cbd5e1' },
  pillText: { color: '#0f172a', fontSize: 13 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  cell: { color: '#0f172a' },
});
