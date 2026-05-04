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
        {
          backgroundColor: colors.inputBg,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.accent} />
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, fontSize: fs(15) }]}
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
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.glow1, { backgroundColor: accentSoft }]} />
      <View style={[styles.glow2, { backgroundColor: accentSoft }]} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: windowHeight - insets.top - insets.bottom,
              paddingHorizontal: 24,
            },
          ]}
        >
          <View style={styles.hero}>
            <View style={[styles.logoOuter, { borderColor: `${colors.accent}66` }]}>
              <View style={[styles.logoInner, { backgroundColor: colors.bgSecondary }]}>
                <Ionicons name="person-add" size={38} color={colors.accent} />
              </View>
            </View>

            <Text style={[styles.brand, { color: colors.text, fontSize: fs(30) }]}>
              COACH<Text style={{ color: colors.accent }}>PAD</Text>
            </Text>

            <Text style={[styles.slogan, { color: colors.textMuted, fontSize: fs(13) }]}>
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
            <Text style={[styles.title, { color: colors.text, fontSize: fs(24) }]}>
              {t.createAccountTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fs(13) }]}>
              {t.createAccountSubtitle}
            </Text>

            <View style={{ height: 24 }} />

            <Input
              icon="person-outline"
              placeholder={t.namePlaceholder}
              value={name}
              onChangeText={setName}
            />

            <Input
              icon="mail-outline"
              placeholder={t.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <Input
              icon="lock-closed-outline"
              placeholder={t.passwordShort}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Input
              icon="shield-checkmark-outline"
              placeholder={t.confirmPasswordPlaceholder}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {error ? (
              <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            ) : null}

            <Animated.View style={{ transform: [{ scale }], marginTop: 10 }}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPressIn={() => animate(0.97)}
                onPressOut={() => animate(1)}
                onPress={handleRegister}
              >
                {loading ? (
                  <ActivityIndicator color={colors.accentForeground} />
                ) : (
                  <>
                    <Text style={[styles.buttonText, { color: colors.accentForeground }]}>
                      {t.registerCta}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.accentForeground} />
                  </>
                )}
              </Pressable>
            </Animated.View>

            <TouchableOpacity style={styles.linkWrap} onPress={() => navigation.goBack()}>
              <Text style={[styles.link, { color: colors.textMuted }]}>
                {t.haveAccountPrompt}{" "}
                <Text style={[styles.linkAccent, { color: colors.accent }]}>{t.signInLink}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
