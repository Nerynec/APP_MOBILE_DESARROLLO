import React from "react";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { CartProvider } from "./src/contexts/CartContext";
import { ProductProvider } from "./src/contexts/ProductContext";
import { InventoryProvider } from "./src/contexts/InventoryContext";
import { PurchaseProvider } from "./src/contexts/PurchaseContext";
import AppNavigator from "./src/navigation/AppNavigator";

// 🎨 Tema Material 3 con paleta personalizada
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#0b5ed7",
    secondary: "#6ad0ff",
    error: "#e11d48",
    success: "#16a34a",
    warning: "#f59e0b",
    accent: "#fb923c",
    background: "#f3f7fb",
    surface: "#ffffff",
    onPrimary: "#ffffff",
  },
  icon: (props: any) => <MaterialCommunityIcons {...props} />,
};

// Wrapper para esperar al estado de autenticación
function AppContent() {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            <InventoryProvider>
              <PurchaseProvider>
                <NavigationContainer>
                  <AppContent />
                </NavigationContainer>
              </PurchaseProvider>
            </InventoryProvider>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
