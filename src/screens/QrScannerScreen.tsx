import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import api from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";

/* =========================
   TYPES
========================= */

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Main: { screen?: string };
  DetalheTurma: undefined;
  FrequenciaAluno: undefined;
  QrScanner: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

/* ========================= */

export default function QrScanner() {
  const [permission, requestPermission] = useCameraPermissions();

  const { token } = useContext(AuthContext);

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProps>();

  /* =========================
     JOIN CLASS GROUP
  ========================= */

  const joinClassGroup = async (qrToken: string) => {
    try {
      setLoading(true);

      await api.post(
        "/class-groups/join",
        {
          qrToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert("Sucesso", "Você entrou na turma!");
    } catch (err: any) {
      console.log("Erro joinClassGroup:", err?.response?.data?.message);

      Alert.alert("Erro", "Não foi possível entrar na turma.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PERMISSÃO
  ========================= */

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Carregando câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>Permita o acesso à câmera</Text>

        <Button title="Permitir" onPress={requestPermission} />
      </View>
    );
  }

  /* =========================
     SCAN HANDLER
  ========================= */

  const handleScan = async (result: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);

    const qrToken = result.data;

    // Fecha o scanner imediatamente na primeira leitura,
    // impedindo que novos eventos de câmera disparem.
    navigation.goBack();

    await joinClassGroup(qrToken);
  };

  /* =========================
     UI
  ========================= */

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Entrando na turma...</Text>
        </View>
      )}
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "rgba(0,0,0,0.6)",

    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
});
