// src/components/UserFormModal.tsx
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { CreateUserInput, UpdateUserInput } from '../services/users';
import { createUser, updateUser } from '../services/users';

export type Mode = 'create' | 'edit';

// Si tu UserDto no tiene user_id en el type, ajusta aquí el tipo a 'any' o extiéndelo.
type UserDto = any;

type Props = {
  visible: boolean;
  mode: Mode;
  user?: UserDto | null;
  rolesCatalog: string[];
  onClose: () => void;
  onSaved: (u: UserDto) => void;
};

type State = {
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
  roles: Set<string>;
  loading: boolean;
  error: string;
  touched: { [k: string]: boolean };
};

export class UserFormModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fullName: '',
      email: '',
      password: '',
      isActive: true,
      roles: new Set<string>(),
      loading: false,
      error: '',
      touched: {},
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { visible, mode, user } = this.props;
    if (visible && visible !== prevProps.visible) {
      if (mode === 'edit' && user) {
        this.setState({
          fullName: user.full_name ?? '',
          email: user.email ?? '',
          password: '',
          isActive: !!user.is_active,
          roles: new Set(user.roles || []),
          error: '',
          touched: {},
        });
      } else if (mode === 'create') {
        this.setState({
          fullName: '',
          email: '',
          password: '',
          isActive: true,
          roles: new Set(),
          error: '',
          touched: {},
        });
      }
    }
  }

  emailValid() {
    return /\S+@\S+\.\S+/.test(this.state.email.trim());
  }
  passwordOk() {
    return this.props.mode === 'edit'
      ? this.state.password.trim().length === 0 || this.state.password.trim().length >= 6
      : this.state.password.trim().length >= 6;
  }
  canSave() {
    return !!this.state.fullName.trim() && this.emailValid() && this.passwordOk();
  }

  toggleRole = (r: string) => {
    const roles = new Set(this.state.roles);
    if (roles.has(r)) roles.delete(r);
    else roles.add(r);
    this.setState({ roles });
  };

  save = async () => {
    if (!this.canSave()) return;
    this.setState({ loading: true, error: '' });
    try {
      if (this.props.mode === 'create') {
        const payload: CreateUserInput = {
          fullName: this.state.fullName.trim(),
          email: this.state.email.trim(),
          password: this.state.password.trim(),
          isActive: this.state.isActive,
          roles: Array.from(this.state.roles),
        };
        const u = await createUser(payload);
        this.props.onSaved(u);
        this.props.onClose();
      } else if (this.props.mode === 'edit' && this.props.user) {
        const payload: UpdateUserInput = {
          fullName: this.state.fullName.trim(),
          email: this.state.email.trim(),
          isActive: this.state.isActive,
          roles: Array.from(this.state.roles),
        };
        if (this.state.password.trim()) payload.password = this.state.password.trim();
        const u = await updateUser(this.props.user.user_id, payload);
        this.props.onSaved(u);
        this.props.onClose();
      }
    } catch (e: any) {
      this.setState({ error: e?.response?.data?.message || 'No se pudo guardar el usuario' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { visible, onClose, rolesCatalog, mode } = this.props;
    const { fullName, email, password, isActive, roles, loading, error, touched } = this.state;

    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</Text>
              <Pressable onPress={onClose}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              {/* Nombre */}
              <View style={styles.field}>
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                  value={fullName}
                  onChangeText={(t) => this.setState({ fullName: t })}
                  onBlur={() => this.setState({ touched: { ...touched, fullName: true } })}
                  placeholder="Ej. Ana López"
                  style={[styles.input, touched.fullName && !fullName.trim() && styles.inputError]}
                />
                {touched.fullName && !fullName.trim() && (
                  <Text style={styles.helperError}>Ingresa el nombre completo.</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => this.setState({ email: t })}
                  onBlur={() => this.setState({ touched: { ...touched, email: true } })}
                  placeholder="mail@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, touched.email && !this.emailValid() && styles.inputError]}
                />
                {touched.email && !this.emailValid() && (
                  <Text style={styles.helperError}>Ingresa un email válido.</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Contraseña {mode === 'edit' && <Text style={styles.note}>(opcional)</Text>}
                </Text>
                <TextInput
                  value={password}
                  onChangeText={(t) => this.setState({ password: t })}
                  onBlur={() => this.setState({ touched: { ...touched, password: true } })}
                  placeholder={mode === 'edit' ? 'Deja vacío para no cambiar' : 'Mínimo 6 caracteres'}
                  secureTextEntry
                  style={[styles.input, touched.password && !this.passwordOk() && styles.inputError]}
                />
                {touched.password && !this.passwordOk() && (
                  <Text style={styles.helperError}>La contraseña debe tener al menos 6 caracteres.</Text>
                )}
              </View>

              {/* Activo */}
              <View style={[styles.field, styles.row]}>
                <Text style={styles.label}>Activo</Text>
                <Switch
                  value={isActive}
                  onValueChange={(v) => this.setState({ isActive: v })}
                />
              </View>

              {/* Roles */}
              <View style={styles.field}>
                <Text style={styles.label}>Roles</Text>
                <View style={styles.rolesWrap}>
                  {rolesCatalog.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => this.toggleRole(r)}
                      style={[styles.roleChip, roles.has(r) && styles.roleChipActive]}
                    >
                      <Text style={[styles.roleText, roles.has(r) && styles.roleTextActive]}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
                {!!error && <Text style={styles.helperError}>{error}</Text>}
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={loading || !this.canSave()}
                onPress={this.save}
                style={[styles.btn, styles.btnPrimary, (loading || !this.canSave()) && styles.btnDisabled]}
              >
                <Text style={styles.btnPrimaryText}>
                  {loading ? 'Guardando…' : mode === 'create' ? 'Crear' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '92%' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '600' },
  close: { fontSize: 18 },
  body: { padding: 16, gap: 16 },
  field: {},
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  inputError: { borderColor: '#f43f5e' },
  helperError: { marginTop: 6, color: '#b91c1c', fontSize: 12 },
  note: { color: '#64748b', fontSize: 12 },
  rolesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: {
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  roleChipActive: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  roleText: { color: '#0f172a', fontSize: 13 },
  roleTextActive: { color: '#3730a3', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  btn: { height: 44, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#4f46e5' },
  btnPrimaryText: { color: 'white', fontWeight: '600' },
  btnGhost: { borderWidth: 1, borderColor: '#e5e7eb' },
  btnGhostText: { color: '#111827' },
  btnDisabled: { opacity: 0.7 },
});
