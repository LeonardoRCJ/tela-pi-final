// JoinClassGroup.tsx

import React, { useState, useContext, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";

import { AppContext } from "../context/AppContext";

import api from "../services/api";

/* =========================
   TIPAGEM DAS ROTAS
========================= */

type RootStackParamList = {
  JoinClassGroup: { qrToken?: string } | undefined;

  QrScanner: undefined;
};

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  "JoinClassGroup"
>;

type RouteProps = RouteProp<RootStackParamList, "JoinClassGroup">;

/* ========================= */

export default function JoinClassGroup() {
  const navigation = useNavigation<NavigationProps>();

  const route = useRoute<RouteProps>();

  const { token } = useContext(AuthContext);

  const { getFontSize } = useContext(AppContext);

  const [qrToken, setQrToken] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = route.params?.qrToken;

    if (code) {
      setQrToken(code);
    }
  }, [route.params]);

  function openScanner() {
    navigation.push("QrScanner");
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{
            flex: 1,
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: getFontSize(22),
                },
              ]}
            >
              Entrar na Turma
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: getFontSize(13),
                },
              ]}
            >
              Escaneie o QR Code ou digite o código.
            </Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
              <Ionicons name="qr-code" size={34} color="#0F0F0F" />

              <Text style={styles.scanText}>Escanear QR</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>ou</Text>

            <TextInput
              placeholder="Código da turma"
              placeholderTextColor="#666"
              value={qrToken}
              onChangeText={setQrToken}
              style={styles.input}
            />

            <TouchableOpacity style={styles.joinButton} disabled={loading}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#0F0F0F" />

                  <Text style={styles.joinText}>Entrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 20,
  },

  header: {
    marginTop: 20,
    marginBottom: 30,
  },

  title: {
    color: "#FFF",
    fontWeight: "bold",
  },

  subtitle: {
    color: "#888",
    marginTop: 8,
  },

  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
  },

  scanButton: {
    backgroundColor: "#D4AF37",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
  },

  scanText: {
    color: "#0F0F0F",
    fontWeight: "bold",
    marginTop: 10,
  },

  orText: {
    color: "#666",
    textAlign: "center",
    marginVertical: 18,
  },

  input: {
    backgroundColor: "#252525",
    color: "#FFF",
    padding: 16,
    borderRadius: 14,
  },

  joinButton: {
    backgroundColor: "#D4AF37",
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  joinText: {
    color: "#0F0F0F",
    fontWeight: "bold",
  },
});
