import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import TermsModal from "./TermsModal";

export type RootStackParamList = {
  SignIn: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const { height: windowHeight } = Dimensions.get("window");

function Input({ icon, ...props }: any) {
  const { colors, fs } = useTheme();
  return (
    <View
      style={[
        styles.inputWrap,
        { borderColor: colors.cardBorder, backgroundColor: colors.inputBg },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <TextInput
        style={[styles.input, { color: colors.text, fontSize: fs(12) }]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

export default function Cadastro() {
  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();
  const { colors, fs, t, isDark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // ← ADICIONADO
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
    }).start();
  };

  async function handleRegister() {
    try {
      setError("");
      if (!name || !email || !password || !confirmPassword) {
        setError(t.fillAllFields);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordsMismatch);
        return;
      }
      // ← ADICIONADO
      if (!termsAccepted) {
        setError((t as any).termsRequired ?? "Você precisa aceitar os Termos de Uso.");
        return;
      }
      setLoading(true);
      await api.post("/auth/sign-up", {
        name,
        email,
        password,
      });
      navigation.navigate("SignIn");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t.registerFailed);
    } finally {
      setLoading(false);
    }
  }

  const accentSoft = isDark ? `${colors.accent}18` : `${colors.accent}28`;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.glow1, { backgroundColor: accentSoft }]} />
      <View style={[styles.glow2, { backgroundColor: accentSoft }]} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: 24, minHeight: windowHeight * 0.85 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View
              style={[
                styles.logoOuter,
                { borderColor: colors.cardBorder, backgroundColor: colors.card },
              ]}
            >
              <View style={[styles.logoInner, { backgroundColor: colors.accent }]}>
                <Ionicons name="barbell-outline" size={34} color="#fff" />
              </View>
            </View>
            <Text style={[styles.brand, { color: colors.accent, fontSize: fs(12) }]}>
              COACHPAD
            </Text>
            <Text style={[styles.slogan, { color: colors.textMuted, fontSize: fs(12) }]}>
              {t.signUpHeroSlogan}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.accent,
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.text, fontSize: fs(12) }]}>
              {t.createAccountTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fs(12) }]}>
              {t.createAccountSubtitle}
            </Text>

            <View style={{ marginTop: 20 }}>
              <Input
                icon="person-outline"
                placeholder={t.namePlaceholder}
                value={name}
                onChangeText={setName}
                accessibilityLabel={t.namePlaceholder}
              />
              <Input
                icon="mail-outline"
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                accessibilityLabel="E-mail"
              />
              <Input
                icon="lock-closed-outline"
                placeholder={t.passwordPlaceholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                accessibilityLabel={t.passwordPlaceholder}
              />
              <Input
                icon="lock-closed-outline"
                placeholder={t.confirmPasswordPlaceholder}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                accessibilityLabel={t.confirmPasswordPlaceholder}
              />
            </View>

            {/* ← ADICIONADO: Checkbox Termos */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setTermsAccepted((v) => !v)}
              activeOpacity={0.7}
              accessibilityLabel={(t as any).termsPrompt ?? "Aceitar termos de uso"}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: termsAccepted }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.accent,
                    backgroundColor: termsAccepted ? colors.accent : "transparent",
                  },
                ]}
              >
                {termsAccepted && (
                  <Ionicons name="checkmark" size={14} color={colors.accentForeground} />
                )}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: fs(12), flex: 1 }}>
                {(t as any).termsPrompt ?? "Li e aceito os "}
                <Text
                  style={{ color: colors.accent, fontWeight: "700" }}
                  onPress={() => setTermsVisible(true)}
                >
                  {(t as any).termsLink ?? "Termos de Uso"}
                </Text>
              </Text>
            </TouchableOpacity>

            {error ? (
              <Text style={[styles.error, { color: "#e53e3e", fontSize: fs(12) }]}>
                {error}
              </Text>
            ) : null}

            <Animated.View style={{ transform: [{ scale }] }}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPressIn={() => animate(0.97)}
                onPressOut={() => animate(1)}
                onPress={handleRegister}
                accessibilityLabel={t.registerCta}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={20} color="#fff" />
                    <Text style={[styles.buttonText, { color: "#fff", fontSize: fs(12) }]}>
                      {t.registerCta}
                    </Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </View>

          <TouchableOpacity style={styles.linkWrap} onPress={() => navigation.goBack()} accessibilityLabel={t.signInLink} accessibilityRole="button">
            <Text style={[styles.link, { color: colors.textMuted, fontSize: fs(12) }]}>
              {t.haveAccountPrompt}{" "}
            </Text>
            <Text style={[styles.linkAccent, { color: colors.accent, fontSize: fs(12) }]}>
              {t.signInLink}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ← ADICIONADO: Modal */}
      <TermsModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        showAcceptButton
        onAccept={() => setTermsAccepted(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glow1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    top: -60,
    right: -70,
  },
  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    bottom: -50,
    left: -60,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 32,
  },
  hero: {
    alignItems: "center",
    marginBottom: 34,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  brand: {
    fontWeight: "900",
    letterSpacing: 4,
  },
  slogan: {
    marginTop: 8,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 6,
  },
  inputWrap: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    marginLeft: 12,
  },
  // ← ADICIONADO
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  error: {
    marginTop: 2,
    marginBottom: 8,
  },
  button: {
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    fontWeight: "900",
    letterSpacing: 2,
  },
  linkWrap: {
    marginTop: 22,
    alignItems: "center",
  },
  link: {},
  linkAccent: {
    fontWeight: "700",
  },
});