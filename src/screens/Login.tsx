import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { signInSchema } from "../zod/schemas";
import api from "../services/api";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Main: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

function Input({ icon, ...props }: any) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={20} color="#D4AF37" />
      <TextInput
        placeholderTextColor="#666"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export default function Login() {
  const navigation = useNavigation<NavigationProps>();
  const { login } = useContext(AuthContext);
  const { fs } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scale = useRef(new Animated.Value(1)).current;

  const {
    control,
    handleSubmit,
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
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* TOPO */}
        <View style={styles.hero}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons name="shield-half" size={42} color="#D4AF37" />
            </View>
          </View>

          <Text style={[styles.brand, { fontSize: fs(32) }]}>
            COACH<Text style={{ color: "#D4AF37" }}>PAD</Text>
          </Text>

          <Text style={[styles.slogan, { fontSize: fs(13) }]}>
            Disciplina • Honra • Evolução
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={[styles.title, { fontSize: fs(24) }]}>
            Bem-vindo
          </Text>

          <Text style={[styles.subtitle, { fontSize: fs(13) }]}>
            Faça login para continuar
          </Text>

          <View style={{ height: 28 }} />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                icon="mail-outline"
                placeholder="Seu email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                icon="lock-closed-outline"
                placeholder="Sua senha"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View
            style={{
              transform: [{ scale }],
              marginTop: 10,
            }}
          >
            <Pressable
              style={styles.button}
              onPressIn={() => animate(0.97)}
              onPressOut={() => animate(1)}
              onPress={handleSubmit(onSubmit)}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.buttonText}>ENTRAR</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#000"
                  />
                </>
              )}
            </Pressable>
          </Animated.View>

          <TouchableOpacity style={styles.register}>
            <Text style={styles.registerText}>
              Não possui conta?{" "}
              <Text
                style={styles.registerAccent}
                onPress={() => navigation.navigate("SignUp")}
              >
                Cadastre-se
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#080808",
  },

  glow1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: "#D4AF3710",
    top: -60,
    right: -80,
  },

  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 200,
    backgroundColor: "#D4AF3708",
    bottom: -40,
    left: -60,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
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
    borderColor: "#D4AF3740",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  logoInner: {
    width: 78,
    height: 78,
    borderRadius: 999,
    backgroundColor: "#151515",
    justifyContent: "center",
    alignItems: "center",
  },

  brand: {
    color: "#FFF",
    fontWeight: "900",
    letterSpacing: 4,
  },

  slogan: {
    color: "#666",
    marginTop: 8,
    letterSpacing: 1.5,
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#222",
    shadowColor: "#D4AF37",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  title: {
    color: "#FFF",
    fontWeight: "800",
  },

  subtitle: {
    color: "#777",
    marginTop: 6,
  },

  inputWrap: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    color: "#FFF",
    fontSize: 15,
  },

  button: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  buttonText: {
    color: "#000",
    fontWeight: "900",
    letterSpacing: 2,
  },

  error: {
    color: "#FF4444",
    marginTop: 4,
    marginBottom: 8,
  },

  register: {
    marginTop: 22,
    alignItems: "center",
  },

  registerText: {
    color: "#777",
  },

  registerAccent: {
    color: "#D4AF37",
    fontWeight: "700",
  },
});