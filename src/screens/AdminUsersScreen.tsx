// src/screens/UsersScreen.tsx
import React from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { listUsers, listRoles, deleteUser } from '../services/users';
import { UserFormModal, type Mode } from '../components/UserFormModal';

// ——— Si tu UserDto NO trae user_id en el type, añádelo en services/users.ts ———
// type UserDto = { user_id: number; full_name: string; email: string; is_active: boolean; created_at: string; roles: string[]; };
type UserDto = any;

type StatusFilter = 'all' | 'active' | 'inactive';

type State = {
  loading: boolean;
  error: string;
  users: UserDto[];
  q: string;
  roleFilter: string;
  statusFilter: StatusFilter;
  rolesCatalog: string[];
  showModal: boolean;
  mode: Mode;
  selected: UserDto | null;
};

function initials(name?: string) {
  if (!name) return 'U';
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U'
  );
}

class Pill extends React.PureComponent<{
  active?: boolean;
  onPress?: () => void;
  label: string;
}> {
  render() {
    const { active, onPress, label } = this.props;
    return (
      <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
      </Pressable>
    );
  }
}

class Segmented extends React.PureComponent<{
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
  options: { label: string; value: StatusFilter }[];
}> {
  render() {
    const { value, onChange, options } = this.props;
    return (
      <View style={styles.segmented}>
        {options.map((o) => (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segment, value === o.value && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, value === o.value && styles.segmentTextActive]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }
}

export default class UsersScreen extends React.Component<{}, State> {
  private qTimer?: NodeJS.Timeout;

  constructor(props: {}) {
    super(props);
    this.state = {
      loading: false,
      error: '',
      users: [],
      q: '',
      roleFilter: '',
      statusFilter: 'all',
      rolesCatalog: [],
      showModal: false,
      mode: 'create',
      selected: null,
    };
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    this.setState({ loading: true, error: '' });
    try {
      const [u, roles] = await Promise.all([listUsers(), listRoles()]);
      this.setState({ users: u as any[], rolesCatalog: roles });
    } catch (e: any) {
      this.setState({ error: e?.response?.data?.message || 'No se pudo cargar usuarios' });
    } finally {
      this.setState({ loading: false });
    }
  }

  setQDebounced = (text: string) => {
    if (this.qTimer) clearTimeout(this.qTimer);
    this.qTimer = setTimeout(() => this.setState({ q: text }), 250);
  };

  filtered() {
    const { users, q, roleFilter, statusFilter } = this.state;
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      const inText =
        !term ||
        (u.full_name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.roles || []).some((r: string) => r.toLowerCase().includes(term));
      const inRole = !roleFilter || (u.roles || []).includes(roleFilter);
      const inStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'inactive' && !u.is_active);
      return inText && inRole && inStatus;
    });
  }

  openCreate = () => this.setState({ showModal: true, mode: 'create', selected: null });
  openEdit = (u: UserDto) => this.setState({ showModal: true, mode: 'edit', selected: u });

  confirmDelete = (u: UserDto) => {
    Alert.alert('Eliminar', `¿Eliminar al usuario ${u.full_name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(u.user_id);
            await this.load();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  renderItem = ({ item }: { item: UserDto }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(item.full_name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {item.full_name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {item.email}
          </Text>
          <View style={styles.rolesWrap}>
            {(item.roles || []).map((r: string) => (
              <View key={r} style={styles.rolePill}>
                <Text style={styles.roleText}>{r}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.status, item.is_active ? styles.statusActive : styles.statusInactive]}>
            <Text
              style={[
                styles.statusText,
                item.is_active ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {item.is_active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => this.openEdit(item)}>
          <Text style={styles.btnGhostText}>Editar</Text>
        </Pressable>
      </View>
    </View>
  );

  render() {
    const { loading, error, rolesCatalog, roleFilter, statusFilter, showModal, mode, selected } =
      this.state;
    const filtered = this.filtered();

    return (
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <View>
            <Text style={styles.h1}>Usuarios</Text>
            <View style={styles.h1Underline} />
          </View>
          <Text style={styles.results}>{`(${filtered.length} resultados)`}</Text>
          <Pressable onPress={this.openCreate} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>＋ Nuevo usuario</Text>
          </Pressable>
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TextInput
            onChangeText={this.setQDebounced}
            placeholder="Buscar por nombre, email o rol…"
            style={styles.search}
          />

          <View style={styles.selectWrap}>
            <Text style={styles.selectLabel}>Rol</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Pill
                label="Todos"
                active={roleFilter === ''}
                onPress={() => this.setState({ roleFilter: '' })}
              />
              {rolesCatalog.map((r) => (
                <Pill
                  key={r}
                  label={r}
                  active={roleFilter === r}
                  onPress={() => this.setState({ roleFilter: r })}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.segmentedWrap}>
            <Segmented
              value={statusFilter}
              onChange={(v) => this.setState({ statusFilter: v })}
              options={[
                { label: 'Todos', value: 'all' },
                { label: 'Activos', value: 'active' },
                { label: 'Inactivos', value: 'inactive' },
              ]}
            />
          </View>
        </View>

        {/* Lista */}
        {loading ? (
          <View style={{ padding: 16 }}>
            <View style={{ gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={{ height: 72, borderRadius: 12, backgroundColor: '#e5e7eb' }} />
              ))}
            </View>
          </View>
        ) : error ? (
          <View style={{ padding: 32 }}>
            <Text style={{ color: '#b91c1c' }}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(u: any) => String(u.user_id)}
            renderItem={this.renderItem}
            contentContainerStyle={{ padding: 12, gap: 12 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Sin resultados</Text>
              </View>
            }
          />
        )}

        {/* Modal */}
        <UserFormModal
          visible={showModal}
          mode={mode}
          user={selected}
          rolesCatalog={rolesCatalog}
          onClose={() => this.setState({ showModal: false })}
          onSaved={async () => {
            this.setState({ showModal: false });
            await this.load();
          }}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  headerWrap: { padding: 12, gap: 8, flexDirection: 'row', alignItems: 'center' },
  h1: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  h1Underline: { height: 4, width: 64, backgroundColor: '#6366f1', borderRadius: 999, marginTop: 4 },
  results: { marginLeft: 8, color: '#64748b' },
  primaryBtn: {
    marginLeft: 'auto',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: 'white', fontWeight: '600' },

  toolbar: { paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  search: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 12 },
  selectWrap: { gap: 6 },
  selectLabel: { fontSize: 12, color: '#334155' },
  segmentedWrap: {},

  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pillActive: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  pillText: { color: '#0f172a', fontSize: 13 },
  pillTextActive: { color: '#3730a3', fontWeight: '600' },

  segmented: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 12 },
  segment: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  segmentActive: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  segmentText: { color: '#475569' },
  segmentTextActive: { color: '#0f172a', fontWeight: '600' },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    gap: 12,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#3730a3', fontWeight: '700' },
  name: { fontWeight: '600', color: '#0f172a' },
  email: { color: '#64748b', marginTop: 2 },
  rolesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  rolePill: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
  },
  roleText: { color: '#1d4ed8', fontSize: 12 },
  status: { alignSelf: 'flex-start', marginTop: 6, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  statusActive: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  statusInactive: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  statusText: { fontSize: 12 },
  statusTextActive: { color: '#047857' },
  statusTextInactive: { color: '#475569' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnGhost: { borderColor: '#e5e7eb', backgroundColor: 'white' },
  btnGhostText: { color: '#0f172a' },
  btnDanger: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  btnDangerText: { color: '#b91c1c' },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#64748b' },
});
