import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import React, { useState } from "react";
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
import { useTheme } from "../context/ThemeContext";

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Main: { screen?: string };
  DetalheTurma: undefined;
  FrequenciaAluno: undefined;
  QrScanner: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export default function QrScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const { colors, fs, t } = useTheme();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  const joinClassGroup = async (qrToken: string) => {
    try {
      setLoading(true);
      await api.post(
        "/class-groups/join",
        { qrToken },
      );
      Alert.alert(t.qrSuccessTitle, t.qrSuccessBody);
    } catch (err: any) {
      console.log("Erro joinClassGroup:", err?.response?.data?.message);
      Alert.alert(t.qrErrorTitle, t.qrErrorBody);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} />
        <Text style={{ color: colors.text, marginTop: 12, fontSize: fs(15) }}>
          {t.cameraLoading}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ marginBottom: 10, color: colors.text, fontSize: fs(16) }}>
          {t.cameraPermission}
        </Text>
        <Button title={t.allow} onPress={requestPermission} accessibilityLabel={t.allow ?? "Permitir acesso à câmera"} />
      </View>
    );
  }

  const handleScan = async (result: BarcodeScanningResult) => {
    if (scanned || loading) return;
    setScanned(true);
    const qrToken = result.data;
    navigation.goBack();
    await joinClassGroup(qrToken);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text, fontSize: fs(15) }]}>
            {t.joiningClass}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

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
    marginTop: 10,
  },
});
