import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// SCREENS
import Login from './src/screens/Login';
import TurmasChamada from './src/screens/TurmasChamada';
import DetalheTurma from './src/screens/DetalheTurma';
import PerfilProfessor from './src/screens/PerfilProfessor';
import FrequenciaAluno from './src/screens/Frequencia';
import Cadastro from './src/screens/Cadastro';
import { AppProvider } from './src/context/AppContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1A1A1A', height: 60, borderTopWidth: 0 },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Chamadas"
        component={TurmasChamada}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={PerfilProfessor}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (  
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login" 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right' // Melhora a transição entre telas
          }}
        >
          {/* Telas de Autenticação */}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />

          {/* Fluxo Principal do App */}
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="DetalheTurma" component={DetalheTurma} />
          <Stack.Screen name="FrequenciaAluno" component={FrequenciaAluno} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}