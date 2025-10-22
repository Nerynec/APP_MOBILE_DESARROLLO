import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  View,
  Dimensions,
} from "react-native";
import { Text, TextInput, Button, Card, useTheme } from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
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

  const onLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const loggedUser = await login({ email: username.trim(), password });
      const isAdmin = !!loggedUser?.roles?.includes("ADMIN");

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
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo y título */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🔩</Text>
              </View>
              <Text style={styles.title}>Tornillo Feliz</Text>
              <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
            </View>

            {/* Card principal */}
            <Card mode="elevated" style={styles.card}>
              <Card.Content style={styles.cardContent}>
                {/* Input Usuario */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    label="Usuario"
                    mode="outlined"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errors.username) setErrors({ ...errors, username: "" });
                    }}
                    left={<TextInput.Icon icon="account" color="#667eea" />}
                    error={!!errors.username}
                    style={styles.input}
                    editable={!isLoading}
                    autoCapitalize="none"
                    outlineStyle={styles.inputOutline}
                    theme={{
                      colors: {
                        primary: '#667eea',
                        outline: '#e2e8f0',
                      },
                    }}
                  />
                  {errors.username ? (
                    <Animated.View style={styles.errorContainer}>
                      <Text style={styles.errorText}>⚠️ {errors.username}</Text>
                    </Animated.View>
                  ) : null}
                </View>

                {/* Input Contraseña */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    label="Contraseña"
                    mode="outlined"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock" color="#667eea" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                        color="#94a3b8"
                      />
                    }
                    error={!!errors.password}
                    style={styles.input}
                    editable={!isLoading}
                    autoCapitalize="none"
                    outlineStyle={styles.inputOutline}
                    theme={{
                      colors: {
                        primary: '#667eea',
                        outline: '#e2e8f0',
                      },
                    }}
                  />
                  {errors.password ? (
                    <Animated.View style={styles.errorContainer}>
                      <Text style={styles.errorText}>⚠️ {errors.password}</Text>
                    </Animated.View>
                  ) : null}
                </View>

                {/* Botón Iniciar Sesión */}
                <Button
                  mode="contained"
                  onPress={onLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonLabel}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? "Ingresando..." : "Iniciar sesión"}
                </Button>

                {/* Divisor */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>o</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Botón Registro */}
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate("Register")}
                  disabled={isLoading}
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonLabel}
                  contentStyle={styles.buttonContent}
                >
                  Crear cuenta nueva
                </Button>
              </Card.Content>
            </Card>

            {/* Footer decorativo */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🔒 Tus datos están seguros con nosotros
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 32,
    backgroundColor: '#fff',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  cardContent: {
    padding: 28,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 16,
    borderWidth: 2,
  },
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#667eea',
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#fff',
  },
  buttonContent: {
    height: 56,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: 'transparent',
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});