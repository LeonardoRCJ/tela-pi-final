import React, { useContext } from "react";
import "./global.css";

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

// CONTEXTS
import { AuthContext, AuthProvider } from "./src/context/AuthContext";
import { ThemeContext, ThemeProvider, useTheme } from "./src/context/ThemeContext";

// SCREENS
import AlbumDetailScreen from "./src/screens/AlbumDetailScreen";
import AlbumScreen from "./src/screens/AlbumScreen";
import DetalheTurma from "./src/screens/ClassGroupDetail";
import ClassGroups from "./src/screens/ClassGroups";
import FrequenciaAluno from "./src/screens/Frequency";
import Login from "./src/screens/Login";
import MasterAlbumsScreen from "./src/screens/MasterAlbumsScreen";
import PractitionerClassGroupDetail from "./src/screens/PractitionerClassGroupDetail";
import PractitionerClassGroups from "./src/screens/PractitionerClassGroupsScreen";
import Profile from "./src/screens/Profile";
import Cadastro from "./src/screens/SignUp";
import TrainingSessionDetail from "./src/screens/TrainingSessionDetail";

import { PortalHost } from "@rn-primitives/portal";
import { SafeAreaProvider } from "react-native-safe-area-context";
import QrScanner from "./src/screens/QrScannerScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const getToastConfig = (colors: any) => ({
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: colors.success, backgroundColor: colors.card }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: colors.text, fontSize: 16, fontWeight: "bold" }}
      text2Style={{ color: colors.textMuted, fontSize: 13 }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: colors.danger, backgroundColor: colors.card }}
      text1Style={{ color: colors.text }}
      text2Style={{ color: colors.textMuted }}
    />
  ),
});

function MasterTabs() {
const { t } = useContext(ThemeContext)
const { fs, colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: 0.5,
          borderColor: colors.cardBorder
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name={ t.masterClassesTitle}
        component={ClassGroups}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={fs(size)} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={t.profileTitle}
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={fs(size)} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

function PractitionerTabs() {
  const { t } = useContext(ThemeContext)
  const { fs, colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: 0.5,
          borderColor: colors.cardBorder,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name={ t.practitionerClassTitle }
        component={PractitionerClassGroups}
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
        name= { t.profileTitle }
        component={Profile}
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
      <Stack.Navigator
        key={user ? "authed-stack" : "guest-stack"}
        screenOptions={{ headerShown: false }}
      >
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
            <Stack.Screen name="MasterAlbums" component={MasterAlbumsScreen} />
            <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
            <Stack.Screen
              name="TrainingSessionDetail"
              component={TrainingSessionDetail}
            />
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

function AppContent() {
  const { colors } = useTheme();
  return (
    <>
      <AppRoutes />
      <PortalHost />
      <Toast config={getToastConfig(colors)} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
