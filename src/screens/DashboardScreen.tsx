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
      if (d.summary) {
        await saveAndShareText(`resumen_${stamp}.csv`, toCSV([{
          pedidos: d.summary.orders, ingresos: d.summary.revenue, ventas_brutas: d.summary.gross_sales,
          descuentos: d.summary.discounts, impuestos: d.summary.taxes, aov: d.summary.avg_order_value,
        }]));
      }
      if (d.daily?.length) {
        await saveAndShareText(`ingresos_diarios_${stamp}.csv`, toCSV(d.daily.map(x => ({ fecha: x.day, ingresos: x.revenue }))));
      }
      if (d.topProducts?.length) {
        await saveAndShareText(`top_productos_${stamp}.csv`, toCSV(d.topProducts.map(t => ({
          id: t.product_id, producto: t.product_name, unidades: t.units, ingresos: t.revenue,
        }))));
      }
      if (d.byPayment?.length) {
        await saveAndShareText(`por_pago_${stamp}.csv`, toCSV(d.byPayment.map(p => ({
          codigo: p.payment_method_code, metodo: p.payment_method_name, pedidos: p.orders, ingresos: p.revenue,
        }))));
      }
      if (d.byChannel?.length) {
        await saveAndShareText(`por_canal_${stamp}.csv`, toCSV(d.byChannel.map(c => ({
          canal: c.channel, pedidos: c.orders, ingresos: c.revenue,
        }))));
      }
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
          <View style={st.trendContainer}>
            <View style={[st.trendBadge, { backgroundColor: p > 0 ? '#dcfce7' : p < 0 ? '#fee2e2' : '#f1f5f9' }]}>
              <Text style={[st.trendText, { color: trendColor(p) }]}>
                {p > 0 ? '▲' : p < 0 ? '▼' : '—'} {Math.abs(p).toFixed(1)}%
              </Text>
            </View>
            <Text style={st.trendLabel}>vs anterior</Text>
          </View>
        )}
      </View>
    );
  }

  render() {
    const { data, prev, loading, err } = this.state;
    const s = data?.summary, ps = prev?.summary;

    return (
      <SafeAreaView style={st.safeArea}>
        <ScrollView contentContainerStyle={st.wrap}>
          <View style={st.header}>
            <View>
              <Text style={st.h1}>Dashboard de Ventas</Text>
              <Text style={st.hSub}>
                Rango: {format(new Date(this.state.from), 'dd MMM yyyy')} → {format(new Date(this.state.to), 'dd MMM yyyy')}
              </Text>
            </View>

            <View style={st.presetRow}>
              {(['today','7d','30d','mtd','ytd'] as PresetKey[]).map((p) => (
                <Pressable key={p} style={st.chip} onPress={() => this.applyPreset(p)}>
                  <Text style={st.chipText}>
                    {p === 'today' ? 'Hoy' : p === '7d' ? 'Últimos 7d' : p === '30d' ? 'Últimos 30d' : p === 'mtd' ? 'Mes actual' : 'Año actual'}
                  </Text>
                </Pressable>
              ))}
            </View>

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

          {!!err && <View style={st.error}><Text style={st.errorText}>⚠️ {err}</Text></View>}

          {s ? (
            <View style={st.kpiRow}>
              {this.renderKpi('💰 Ingresos', money(s.revenue), s.revenue, ps?.revenue)}
              {this.renderKpi('📦 Pedidos', num(s.orders), s.orders, ps?.orders)}
              {this.renderKpi('💳 AOV', money(s.avg_order_value), s.avg_order_value, ps?.avg_order_value)}
              {this.renderKpi('🏷️ Descuentos', money(s.discounts), s.discounts)}
              {this.renderKpi('🧾 Impuestos', money(s.taxes), s.taxes)}
            </View>
          ) : (<View style={{ padding: 12 }}><ActivityIndicator /></View>)}

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
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  wrap: { 
    padding: 16, 
    gap: 16 
  },
  header: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  h1: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#0f172a', 
    letterSpacing: -0.5 
  },
  hSub: { 
    color: '#64748b', 
    fontSize: 14, 
    marginTop: 2 
  },
  presetRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  chip: { 
    backgroundColor: '#f1f5f9', 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    borderRadius: 999,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: { 
    color: '#1e40af', 
    fontWeight: '700', 
    fontSize: 13 
  },
  dateRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    alignItems: 'center' 
  },
  dateInput: { 
    height: 48, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    paddingHorizontal: 16, 
    backgroundColor: '#f8fafc', 
    flexGrow: 1, 
    minWidth: 180,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  btn: { 
    height: 48, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPrimary: { 
    backgroundColor: '#3b82f6',
  },
  btnPrimaryText: { 
    color: 'white', 
    fontWeight: '800', 
    fontSize: 14, 
    letterSpacing: 0.3 
  },
  btnGhost: { 
    backgroundColor: 'white', 
    borderWidth: 2, 
    borderColor: '#e2e8f0',
  },
  btnGhostText: { 
    color: '#475569', 
    fontWeight: '700', 
    fontSize: 14 
  },
  disabled: { 
    opacity: 0.5 
  },
  error: { 
    padding: 16, 
    borderRadius: 16, 
    backgroundColor: '#fef2f2', 
    borderWidth: 2, 
    borderColor: '#fecaca',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  errorText: { 
    color: '#dc2626', 
    fontWeight: '700', 
    fontSize: 14 
  },
  kpiRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  kpi: { 
    flexGrow: 1, 
    minWidth: 160, 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 18,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  kpiIcon: { 
    fontSize: 28, 
    marginBottom: 4 
  },
  kpiValue: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#0f172a', 
    letterSpacing: -0.5 
  },
  trendContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },
  trendBadge: { 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  trendText: { 
    fontWeight: '800', 
    fontSize: 12 
  },
  trendLabel: { 
    color: '#94a3b8', 
    fontWeight: '600', 
    fontSize: 11, 
    marginLeft: 6 
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: '#0f172a', 
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  tableToolbar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginTop: 8, 
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#f1f5f9',
  },
  search: { 
    flexGrow: 1, 
    height: 46, 
    borderRadius: 14, 
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    paddingHorizontal: 14, 
    backgroundColor: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  pill: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 999, 
    borderWidth: 2, 
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  pillText: { 
    color: '#475569', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9',
  },
  cell: { 
    color: '#1e293b', 
    fontSize: 13, 
    fontWeight: '600' 
  },
});