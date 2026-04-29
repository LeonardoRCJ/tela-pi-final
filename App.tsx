import React, { useContext } from "react";
import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// CONTEXTS
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";

// SCREENS
import Login from "./src/screens/Login";
import Cadastro from "./src/screens/SignUp";
import ClassGroups from "./src/screens/ClassGroups";
import PerfilProfessor from "./src/screens/Profile";
import DetalheTurma from "./src/screens/ClassGroupDetail";
import FrequenciaAluno from "./src/screens/Frequencia";
import JoinClassGroup from "./src/screens/CommonClassGroupsScreen";
import PractitionerClassGroups from "./src/screens/PractitionerClassGroupsScreen";
import PractitionerClassGroupDetail from "./src/screens/PractitionerClassGroupDetail";
import AlbumScreen from "./src/screens/AlbumScreen";

import { PortalHost } from "@rn-primitives/portal";
import QrScanner from "./src/screens/QrScannerScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#87ff06", backgroundColor: "#1A1A1A" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}
      text2Style={{ color: "#CCCCCC", fontSize: 13 }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#FF4444", backgroundColor: "#1A1A1A" }}
      text1Style={{ color: "#FFF" }}
      text2Style={{ color: "#CCC" }}
    />
  ),
};

function MasterTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          height: 60,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tab.Screen
        name="Turmas"
        component={ClassGroups}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Album"
        component={AlbumScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilProfessor}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function PractitionerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          height: 60,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tab.Screen
        name="Turmas"
        component={PractitionerClassGroups}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Entrar"
        component={JoinClassGroup}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Album"
        component={AlbumScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilProfessor}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  const isMaster = user?.role === "MASTER";

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="SignIn" component={Login} />
            <Stack.Screen name="SignUp" component={Cadastro} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={isMaster ? MasterTabs : PractitionerTabs}
            />
            <Stack.Screen name="DetalheTurma" component={DetalheTurma} />
            <Stack.Screen
              name="PractitionerClassGroupDetail"
              component={PractitionerClassGroupDetail}
            />
            <Stack.Screen name="FrequenciaAluno" component={FrequenciaAluno} />
          </>
        )}
        {/* Sempre disponível */}
        <Stack.Screen name="QrScanner" component={QrScanner} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
        <PortalHost />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </AuthProvider>
  );
}