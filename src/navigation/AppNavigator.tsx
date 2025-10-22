import React from "react";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import AppNavigatorHeader from "./AppNavigatorHeader";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProductsScreen from "../screens/ProductsScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ComprasScreen from "../screens/ComprasScreen";
import ReporteriaScreen from "../screens/ReporteriaScreen";
import InventoryScreen from "../screens/InventoryScreen";
import UsersScreen from "../screens/AdminUsersScreen";
import AdminProductScreen from "../screens/AdminProductScreen";
import ProductFormScreen from "../screens/ProductFormScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, status } = useAuth();
  const cart = useCart();

  const isAdmin = !!user?.roles?.includes("ADMIN");

  const commonScreenOptions = {
    headerBackground: () => (
      <LinearGradient
        colors={["#3498db", "#2980b9"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    ),
    headerTintColor: "#fff",
    headerTitleStyle: { fontWeight: "700", fontSize: 20, letterSpacing: 0.5 },
    headerShadowVisible: false,
    ...TransitionPresets.SlideFromRightIOS,
  };

  if (status === "checking") {
    // Loader mientras valida sesión
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0b5ed7" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={commonScreenOptions}>
      {status === "authenticated" ? (
        <>
          {/* Comunes */}
          <Stack.Screen
            name="Products"
            component={ProductsScreen}
            options={({ navigation }) => ({
              title: "🛍️ Productos",
              headerRight: () => <AppNavigatorHeader navigation={navigation} cart={cart} />,
            })}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={({ navigation }) => ({
              title: "🛒 Carrito",
              headerRight: () => <AppNavigatorHeader navigation={navigation} cart={cart} />,
            })}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ title: "💳 Finalizar Compra", gestureEnabled: false }}
          />

          {/* Solo ADMIN */}
          {isAdmin && (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
              <Stack.Screen name="Compras" component={ComprasScreen} options={{ title: "Compras" }} />
              <Stack.Screen name="Reporteria" component={ReporteriaScreen} options={{ title: "Reportería" }} />
              <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: "Inventario" }} />
              <Stack.Screen name="Usuarios" component={UsersScreen} options={{ title: "👥 Usuarios" }} />
              <Stack.Screen name="Administrar" component={AdminProductScreen} options={{ title: "Administrar" }} />
              <Stack.Screen
                name="ProductForm"
                component={ProductFormScreen}
                options={({ route }: any) => ({
                  title: route?.params?.id ? "✏️ Editar producto" : "🆕 Nuevo producto",
                })}
              />
            </>
          )}
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false, animationTypeForReplace: "push" }}
          />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
