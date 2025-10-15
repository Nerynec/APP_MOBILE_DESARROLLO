import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, View, Alert } from 'react-native';
import { Text, TextInput, Button, Card, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const theme = useTheme();

  const onRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Por favor, llena todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await register({ username, password });
      Alert.alert('Cuenta creada 🎉', 'Tu cuenta ha sido registrada con éxito.');
      navigation?.goBack();
    } catch (e: any) {
      console.error('Error en registro:', e);
      Alert.alert('Error al registrar', e.message || 'No se pudo crear la cuenta.');
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
                label="Usuario"
                placeholder="Ingresa tu usuario"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                editable={!loading}
              />

              <TextInput
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
                style={styles.input}
                editable={!loading}
              />

              <TextInput
                label="Confirmar Contraseña"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                mode="outlined"
                left={<TextInput.Icon icon="lock-check" />}
                style={styles.input}
                editable={!loading}
              />

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
});
