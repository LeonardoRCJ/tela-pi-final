import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
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

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { signInSchema } from "../zod/schemas";

const { height: windowHeight } = Dimensions.get("window");

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Main: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

function Input({ icon, error, inputRef, ...props }: any) {
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
          ref={inputRef}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, fontSize: fs(15) }]}
          {...props}
        />
      </View>
      {error ? (
        <Text style={[styles.inputError, { color: colors.danger, fontSize: fs(13) }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function Login() {
  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();
  const { login } = useContext(AuthContext);
  const { colors, fs, t, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scale = useRef(new Animated.Value(1)).current;
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const animate = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
    }).start();
  };

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/sign-in", data);

      await login(response.data.token);
    } catch {
      setError(t.invalidCredentials);
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
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
            <View style={[styles.logoOuter, { borderColor: `${colors.accent}66` }]}>
              <View style={[styles.logoInner, { backgroundColor: colors.bgSecondary }]}>
                <Ionicons name="shield-half" size={42} color={colors.accent} />
              </View>
            </View>

            <Text style={[styles.brand, { fontSize: fs(32), color: colors.text }]}>
              COACH<Text style={{ color: colors.accent }}>PAD</Text>
            </Text>

            <Text style={[styles.slogan, { fontSize: fs(13), color: colors.textMuted }]}>
              {t.tagline}
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
            <Text style={[styles.title, { fontSize: fs(24), color: colors.text }]}>
              {t.welcome}
            </Text>

            <Text style={[styles.subtitle, { fontSize: fs(13), color: colors.textMuted }]}>
              {t.signInSubtitle}
            </Text>

            <View style={{ height: 28 }} />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  inputRef={emailInputRef}
                  icon="mail-outline"
                  placeholder={t.emailPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  error={errors.email?.message?.toString()}
                  accessibilityLabel={t.emailPlaceholder}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  inputRef={passwordInputRef}
                  icon="lock-closed-outline"
                  placeholder={t.passwordPlaceholder}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  error={errors.password?.message?.toString()}
                  accessibilityLabel={t.passwordPlaceholder}
                />
              )}
            />

            {error ? (
              <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            ) : null}

            <Animated.View style={{ transform: [{ scale }], marginTop: 10 }}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPressIn={() => animate(0.97)}
                onPressOut={() => animate(1)}
                onPress={handleSubmit(onSubmit)}
                accessibilityLabel={t.signInCta}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color={colors.accentForeground} />
                ) : (
                  <>
                    <Text style={[styles.buttonText, { color: colors.accentForeground }]}>
                      {t.signInCta}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.accentForeground} />
                  </>
                )}
              </Pressable>
            </Animated.View>

            <TouchableOpacity style={styles.register} accessibilityLabel={t.signUpLink} accessibilityRole="button">
              <Text style={[styles.registerText, { color: colors.textMuted }]}>
                {t.noAccountPrompt}{" "}
                <Text
                  style={[styles.registerAccent, { color: colors.accent }]}
                  onPress={() => navigation.navigate("SignUp")}
                >
                  {t.signUpLink}
                </Text>
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
  inputError: {
    marginLeft: 8,
  },
  error: {
    marginTop: 4,
    marginBottom: 8,
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
