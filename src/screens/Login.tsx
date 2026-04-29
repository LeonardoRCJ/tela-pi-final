import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { SignInForm } from "@/components/sign-in-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react-native";
import { AuthContext } from "../context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Main: {
    screen?: string;
  };
  DetalheTurma: undefined;
  FrequenciaAluno: undefined;
};

type NavigationProps =
  NativeStackNavigationProp<
    RootStackParamList
  >;

export default function Login() {
  const { login } = useContext(AuthContext);

  const [error, setError] = useState<string>("");

  const navigation = useNavigation<NavigationProps>();

  async function handleLogin(email: string, password: string) {
    try {
      const response = await api.post("/auth/sign-in", {
        email,
        password,
      });

      const accessToken = response.data.token;

      login(accessToken);

      navigation.navigate("Main", {
        screen: "Principal",
      });
    } catch (err: any) {
      setError(err.response.data.message);
    }
  }

  return (
    <View className="">
      <SignInForm onSubmit={handleLogin} />
      {error ? (
        <Alert icon={X} variant="destructive">
          <AlertTitle>Erro!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </View>
  );
}
