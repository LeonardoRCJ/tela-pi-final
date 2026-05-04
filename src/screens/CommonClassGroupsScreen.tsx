import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

type RootStackParamList = {
  JoinClassGroup: { qrToken?: string } | undefined;
  QrScanner: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, "JoinClassGroup">;
type RouteProps = RouteProp<RootStackParamList, "JoinClassGroup">;

export default function JoinClassGroup() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { token } = useContext(AuthContext);
  const { colors, fs, t } = useTheme();

  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = route.params?.qrToken;
    if (code) setQrToken(code);
  }, [route.params]);

  function openScanner() {
    navigation.push("QrScanner");
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontSize: fs(22) }]}>
              {t.joinClassTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fs(13) }]}>
              {t.joinClassSubtitle}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: colors.accent }]}
              onPress={openScanner}
            >
              <Ionicons name="qr-code" size={34} color={colors.accentForeground} />
              <Text style={[styles.scanText, { color: colors.accentForeground, fontSize: fs(15) }]}>
                {t.scanQr}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.orText, { color: colors.textMuted, fontSize: fs(14) }]}>
              {t.or}
            </Text>

            <TextInput
              placeholder={t.classCodePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={qrToken}
              onChangeText={setQrToken}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  fontSize: fs(15),
                },
              ]}
            />

            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: colors.accent }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.accentForeground} />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color={colors.accentForeground} />
                  <Text style={[styles.joinText, { color: colors.accentForeground, fontSize: fs(16) }]}>
                    {t.joinClassButton}
                  </Text>
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
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  scanButton: {
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
  },
  scanText: {
    fontWeight: "bold",
    marginTop: 10,
  },
  orText: {
    textAlign: "center",
    marginVertical: 18,
  },
  input: {
    padding: 16,
    borderRadius: 14,
  },
  joinButton: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  joinText: {
    fontWeight: "bold",
  },
});
