import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import TermsModal from "../../src/components/TermsModal";

type RootStackParamList = {
  SignIn: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const Input = React.forwardRef<
  TextInput,
  {
    icon: string;
    error?: string;
  } & React.ComponentProps<typeof TextInput>
>(({ icon, error, ...props }, ref) => {
  const { colors, fs } = useTheme();

  return (
    <View style={{ marginBottom: error ? 14 : 0 }}>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.danger : colors.cardBorder,
          },
          error && { marginBottom: 4 },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={error ? colors.danger : colors.accent}
        />

        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: fs(15),
            },
          ]}
          {...props}
        />
      </View>

      {error ? (
        <Text
          style={[
            styles.inputError,
            {
              color: colors.danger,
              fontSize: fs(13),
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export default function Cadastro() {
  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();

  const { colors, fs, t, isDark } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const nameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const animate = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
    }).start();
  };

  async function handleRegister() {
    try {
      setError("");

      if (
        !name ||
        !email ||
        !phone ||
        !password ||
        !confirmPassword
      ) {
        setError(t.fillAllFields);
        return;
      }

      if (password !== confirmPassword) {
        setError(t.passwordsMismatch);
        return;
      }

      if (!termsAccepted) {
        setError(
          (t as any).termsRequired ??
            "Você precisa aceitar os Termos de Uso."
        );
        return;
      }

      setLoading(true);

      await api.post("/auth/sign-up", {
        name,
        email,
        phone,
        password,
      });

      navigation.navigate("SignIn");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          t.registerFailed
      );
    } finally {
      setLoading(false);
    }
  }

  const accentSoft = isDark
    ? `${colors.accent}18`
    : `${colors.accent}28`;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <View
        style={[
          styles.glow1,
          {
            backgroundColor: accentSoft,
          },
        ]}
      />

      <View
        style={[
          styles.glow2,
          {
            backgroundColor: accentSoft,
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? insets.top
            : 0
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: 32,
              paddingHorizontal: 24,
            },
          ]}
        >
          <View style={styles.hero}>
            <View
              style={[
                styles.logoOuter,
                {
                  borderColor: `${colors.accent}66`,
                },
              ]}
            >
              <View
                style={[
                  styles.logoInner,
                  {
                    backgroundColor:
                      colors.bgSecondary,
                  },
                ]}
              >
                <Ionicons
                  name="person-add"
                  size={40}
                  color={colors.accent}
                />
              </View>
            </View>

            <Text
              style={[
                styles.brand,
                {
                  fontSize: fs(32),
                  color: colors.text,
                },
              ]}
            >
              COACH
              <Text
                style={{
                  color: colors.accent,
                }}
              >
                PAD
              </Text>
            </Text>

            <Text
              style={[
                styles.slogan,
                {
                  fontSize: fs(13),
                  color: colors.textMuted,
                },
              ]}
            >
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
            <Text
              style={[
                styles.title,
                {
                  fontSize: fs(24),
                  color: colors.text,
                },
              ]}
            >
              {t.createAccountTitle}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: fs(13),
                  color: colors.textMuted,
                },
              ]}
            >
              {t.createAccountSubtitle}
            </Text>

            <View style={{ height: 28 }} />

            <Input
              ref={nameInputRef}
              icon="person-outline"
              placeholder={t.namePlaceholder}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              onSubmitEditing={() =>
                phoneInputRef.current?.focus()
              }
            />

            <Input
              ref={phoneInputRef}
              icon="call-outline"
              placeholder="Telefone"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              returnKeyType="next"
              onSubmitEditing={() =>
                emailInputRef.current?.focus()
              }
            />

            <Input
              ref={emailInputRef}
              icon="mail-outline"
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              onSubmitEditing={() =>
                passwordInputRef.current?.focus()
              }
            />

            <Input
              ref={passwordInputRef}
              icon="lock-closed-outline"
              placeholder={t.passwordPlaceholder}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="next"
              onSubmitEditing={() =>
                confirmPasswordInputRef.current?.focus()
              }
            />

            <Input
              ref={confirmPasswordInputRef}
              icon="lock-closed-outline"
              placeholder={
                t.confirmPasswordPlaceholder
              }
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() =>
                setTermsAccepted((v) => !v)
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.accent,
                    backgroundColor:
                      termsAccepted
                        ? colors.accent
                        : "transparent",
                  },
                ]}
              >
                {termsAccepted && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={
                      colors.accentForeground
                    }
                  />
                )}
              </View>

              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: fs(13),
                  flex: 1,
                }}
              >
                {(t as any).termsPrompt ??
                  "Li e aceito os "}

                <Text
                  style={{
                    color: colors.accent,
                    fontWeight: "700",
                  }}
                  onPress={() =>
                    setTermsVisible(true)
                  }
                >
                  {(t as any).termsLink ??
                    "Termos de Uso"}
                </Text>
              </Text>
            </TouchableOpacity>

            {error ? (
              <Text
                style={[
                  styles.error,
                  {
                    color: colors.danger,
                  },
                ]}
              >
                {error}
              </Text>
            ) : null}

            <Animated.View
              style={{
                transform: [{ scale }],
                marginTop: 10,
              }}
            >
              <Pressable
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      colors.accent,
                  },
                ]}
                onPressIn={() => animate(0.97)}
                onPressOut={() => animate(1)}
                onPress={handleRegister}
              >
                {loading ? (
                  <ActivityIndicator
                    color={
                      colors.accentForeground
                    }
                  />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color:
                            colors.accentForeground,
                        },
                      ]}
                    >
                      {t.registerCta}
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={
                        colors.accentForeground
                      }
                    />
                  </>
                )}
              </Pressable>
            </Animated.View>

            <TouchableOpacity
              style={styles.register}
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text
                style={[
                  styles.registerText,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {t.haveAccountPrompt}{" "}

                <Text
                  style={[
                    styles.registerAccent,
                    {
                      color: colors.accent,
                    },
                  ]}
                >
                  {t.signInLink}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsModal
        visible={termsVisible}
        onClose={() =>
          setTermsVisible(false)
        }
        showAcceptButton
        onAccept={() =>
          setTermsAccepted(true)
        }
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
    borderRadius: 200,
    top: -60,
    right: -80,
  },

  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 200,
    bottom: -40,
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
    marginBottom: 36,
  },

  logoOuter: {
    width: 104,
    height: 104,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  logoInner: {
    width: 78,
    height: 78,
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
    letterSpacing: 1.5,
  },

  card: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 20,
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

  inputError: {
    marginLeft: 8,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
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
    marginTop: 4,
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

  register: {
    marginTop: 22,
    alignItems: "center",
  },

  registerText: {},

  registerAccent: {
    fontWeight: "700",
  },
});