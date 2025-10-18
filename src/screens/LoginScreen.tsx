import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  View,
} from "react-native";
import { Text, TextInput, Button, Card, useTheme } from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const theme = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateForm = () => {
    const newErrors = { username: "", password: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "El usuario es requerido";
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = "Debe tener al menos 3 caracteres";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ... dentro de LoginScreen (tu mismo archivo)
  // LoginScreen.tsx
  const onLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const loggedUser = await login({ email: username.trim(), password });
      const isAdmin = !!loggedUser?.roles?.includes("ADMIN");

      // 👇 redirige según rol
      navigation.reset({
        index: 0,
        routes: [{ name: isAdmin ? "Dashboard" : "Products" }],
      });
    } catch (e: any) {
      setErrors((prev) => ({
        ...prev,
        password: e?.message || "Error al iniciar sesión",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.header}>
            <Text variant="displaySmall">🔩</Text>
            <Text
              variant="headlineLarge"
              style={{ fontWeight: "800", color: theme.colors.primary }}
            >
              Tornillo Feliz
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Bienvenido de nuevo
            </Text>
          </View>

          <Card mode="elevated" style={styles.card}>
            <Card.Content>
              <TextInput
                label="Usuario"
                mode="outlined"
                placeholder="Ingresa tu usuario"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) setErrors({ ...errors, username: "" });
                }}
                left={<TextInput.Icon icon="account" />}
                error={!!errors.username}
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="none"
              />
              {errors.username ? (
                <Text style={{ color: theme.colors.error, fontSize: 12 }}>
                  {errors.username}
                </Text>
              ) : null}

              <TextInput
                label="Contraseña"
                mode="outlined"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                secureTextEntry
                left={<TextInput.Icon icon="lock" />}
                error={!!errors.password}
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="none"
              />
              {errors.password ? (
                <Text style={{ color: theme.colors.error, fontSize: 12 }}>
                  {errors.password}
                </Text>
              ) : null}

              <Button
                mode="contained"
                onPress={onLogin}
                loading={isLoading}
                disabled={isLoading}
                style={{ marginTop: 16, borderRadius: 12 }}
                buttonColor={theme.colors.primary}
                textColor="#fff"
              >
                Iniciar sesión
              </Button>

              <Button
                mode="outlined"
                onPress={() => navigation.navigate("Register")}
                disabled={isLoading}
                style={{
                  marginTop: 12,
                  borderRadius: 12,
                  borderColor: theme.colors.primary,
                }}
                textColor={theme.colors.primary}
              >
                Crear cuenta nueva
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f7fb",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    elevation: 6,
  },
  input: {
    marginBottom: 14,
  },
});
