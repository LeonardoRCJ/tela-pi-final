import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

export type RootStackParamList = {
  SignIn: undefined;
};

type NavigationProps =
  NativeStackNavigationProp<
    RootStackParamList
  >;

export default function Cadastro() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const navigation = useNavigation<NavigationProps>();

  const handleRegister = async () => {
    try {
      const response = await api.post(
        "/auth/sign-up",
        {
          name,
          email,
          password,
        },
        {
          headers: {
            "Content-type": "application/json",
          },
        },
      );

      navigation.navigate("SignIn");
    } catch (err: any) {
      console.log(err.response.data.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* ÍCONE */}
      <Ionicons name="person-add" size={60} color="#D4AF37" />

      {/* TÍTULO */}
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Entre para o mundo noturno</Text>

      {/* NOME */}
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#AAA" />
        <TextInput
          placeholder="Nome"
          placeholderTextColor="#777"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* EMAIL */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#AAA" />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* SENHA */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#AAA" />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#777"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* CONFIRMAR SENHA */}
      <View style={styles.inputContainer}>
        <Ionicons name="shield-checkmark" size={20} color="#AAA" />
        <TextInput
          placeholder="Confirmar senha"
          placeholderTextColor="#777"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* BOTÃO */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      {/* VOLTAR */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>
          Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    padding: 25,
  },

  title: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 15,
  },

  subtitle: {
    color: "#AAA",
    fontSize: 14,
    marginBottom: 30,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    color: "#FFF",
    paddingVertical: 12,
    marginLeft: 10,
  },

  button: {
    backgroundColor: "#D4AF37",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 20,
  },

  linkBold: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
});
