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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  SignIn: undefined;
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

export default function Cadastro() {
  const navigation = useNavigation<NavigationProps>();

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
        setError("Preencha todos os campos.");
        return;
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
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
      setError(
        err?.response?.data?.message ??
          "Não foi possível criar a conta."
      );
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
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons
                name="person-add"
                size={38}
                color="#D4AF37"
              />
            </View>
          </View>

          <Text style={styles.brand}>
            COACH<Text style={{ color: "#D4AF37" }}>PAD</Text>
          </Text>

          <Text style={styles.slogan}>
            Crie sua conta e entre no coachpad
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Comece sua jornada agora
          </Text>

          <View style={{ height: 24 }} />

          <Input
            icon="person-outline"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
          />

          <Input
            icon="mail-outline"
            placeholder="Seu email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Input
            icon="lock-closed-outline"
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Input
            icon="shield-checkmark-outline"
            placeholder="Confirmar senha"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

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
              onPress={handleRegister}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    CADASTRAR
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#000"
                  />
                </>
              )}
            </Pressable>
          </Animated.View>

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.link}>
              Já possui conta?{" "}
              <Text style={styles.linkAccent}>
                Entrar
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
    borderRadius: 999,
    backgroundColor: "#D4AF3710",
    top: -60,
    right: -70,
  },

  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "#D4AF3708",
    bottom: -50,
    left: -60,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
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
    borderColor: "#D4AF3740",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 999,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
  },

  brand: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 4,
  },

  slogan: {
    color: "#777",
    marginTop: 8,
    letterSpacing: 1,
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#222",
    shadowColor: "#D4AF37",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 10,
  },

  title: {
    color: "#FFF",
    fontSize: 24,
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
    color: "#FFF",
    marginLeft: 12,
    fontSize: 15,
  },

  error: {
    color: "#FF4444",
    marginTop: 2,
    marginBottom: 8,
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

  linkWrap: {
    marginTop: 22,
    alignItems: "center",
  },

  link: {
    color: "#777",
  },

  linkAccent: {
    color: "#D4AF37",
    fontWeight: "700",
  },
});