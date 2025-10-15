import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, View, Alert } from 'react-native';
import { Text, TextInput, Button, Card, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const theme = useTheme();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!fullName.trim()) e.fullName = 'Tu nombre es requerido';
    if (!email.trim()) e.email = 'El email es requerido';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Ingresa un email válido';
    if (!password) e.password = 'La contraseña es requerida';
    else if (password.length < 6) e.password = 'Debe tener al menos 6 caracteres';
    if (confirmPassword !== password) e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setErrors({});
      await register({ fullName: fullName.trim(), email: email.trim(), password });
      // Si tu AuthContext hace auto-login, ya estás autenticado aquí:
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, general: e?.message || 'No se pudo registrar' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
          <Card style={styles.headerCard} mode="elevated">
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="displaySmall">🔧</Text>
              <Text variant="titleLarge" style={{ marginTop: 8, fontWeight: '800' }}>
                Tornillo Feliz
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Crea tu cuenta
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.formCard} mode="elevated">
            <Card.Content>
              <TextInput
                label="Nombre completo"
                placeholder="Ej. Juan Pérez"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                error={!!errors.fullName}
                editable={!loading}
              />
              {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}

              <TextInput
                label="Email"
                placeholder="tucorreo@dominio.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                error={!!errors.email}
                editable={!loading}
              />
              {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

              <TextInput
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
                style={styles.input}
                error={!!errors.password}
                editable={!loading}
              />
              {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

              <TextInput
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                mode="outlined"
                left={<TextInput.Icon icon="lock-check" />}
                style={styles.input}
                error={!!errors.confirmPassword}
                editable={!loading}
              />
              {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}

              {errors.general ? <Text style={[styles.error, { marginTop: 6 }]}>{errors.general}</Text> : null}

              <Button
                mode="contained"
                onPress={onRegister}
                loading={loading}
                disabled={loading}
                style={{ marginTop: 12, borderRadius: 12 }}
                buttonColor={theme.colors.primary}
                textColor="#fff"
              >
                {loading ? 'Creando cuenta...' : 'Registrar'}
              </Button>

              <View style={styles.footer}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  ¿Ya tienes una cuenta?
                </Text>
                <Button onPress={() => navigation?.goBack()} compact textColor={theme.colors.secondary}>
                  Inicia sesión
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  headerCard: { marginBottom: 18, borderRadius: 16, alignSelf: 'center', paddingHorizontal: 12 },
  formCard: { borderRadius: 16, padding: 12, marginTop: 8 },
  input: { marginBottom: 12 },
  footer: { marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  error: { color: '#B00020', fontSize: 12 },
});
