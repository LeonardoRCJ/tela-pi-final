import React, { useState, useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANDO SEU CONTEXTO
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { User } from "../interfaces/user";
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

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export default function PerfilProfessor() {
  const navigation = useNavigation<NavigationProps>();

  // PEGANDO TUDO DO CONTEXTO
  const {
    isDarkTheme,
    toggleTheme,
    idioma,
    mudarIdioma,
    fonteMaior,
    toggleFonteMaior,
    getFontSize,
    altoContraste,
    toggleAltoContraste,
    getTextColor,
  } = useContext(AppContext);

  const { token, logout, isMaster } = useContext(AuthContext);

  // Estados do Perfil
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const getUserProfile = async () => {
    const response = await api.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(response.data);
  };

  // Carregar dados salvos do Perfil
  useEffect(() => {
    getUserProfile();
  }, []);

  const abrirEdicao = () => {
    setName(user?.name!);
    setBio(user?.bio);
  };

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          navigation.navigate("SignIn");
          logout();
        },
      },
    ]);
  };

  // CORES DINÂMICAS BASEADAS NO TEMA E NO ALTO CONTRASTE
  const bgColor = isDarkTheme ? "#0F0F0F" : "#F5F5F5";
  const cardColor = isDarkTheme ? "#1A1A1A" : "#FFFFFF";
  const textColor = isDarkTheme ? "#FFFFFF" : "#333333";
  // Aplicando o getTextColor para forçar o texto secundário a ficar mais claro se ativado
  const subTextColor = getTextColor(isDarkTheme ? "#888888" : "#666666");
  const inputBg = isDarkTheme ? "#252525" : "#E8E8E8";

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={[styles.headerSection, { backgroundColor: cardColor }]}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Image
                style={styles.avatarImage}
                source={{
                  uri: user?.profilePhoto,
                }}
              />
            </View>
          </View>

          {/* Aplicando Fonte Dinâmica */}
          <Text
            style={[
              styles.nomeText,
              { color: textColor, fontSize: getFontSize(24) },
            ]}
          >
            {user?.name}
          </Text>
          <Text
            style={[
              styles.bioText,
              { color: subTextColor, fontSize: getFontSize(14) },
            ]}
          >
            {user?.bio}
          </Text>
          <Text style={[styles.roleText, { fontSize: getFontSize(13) }]}>
            {isMaster ? "Mestre" : "Praticante"}
          </Text>

          <TouchableOpacity style={styles.editProfileBtn} onPress={abrirEdicao}>
            <Ionicons
              name="pencil"
              size={16}
              color="#0F0F0F"
              style={{ marginRight: 5 }}
            />
            <Text
              style={[styles.editProfileText, { fontSize: getFontSize(14) }]}
            >
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONFIGURAÇÕES */}
        <View style={styles.settingsSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: subTextColor, fontSize: getFontSize(12) },
            ]}
          >
            PREFERÊNCIAS
          </Text>

          {/* Tema */}
          <View style={[styles.settingRow, { backgroundColor: cardColor }]}>
            <View style={styles.settingIconText}>
              <View style={[styles.iconBox, { backgroundColor: "#333" }]}>
                <Ionicons
                  name={isDarkTheme ? "moon" : "sunny"}
                  size={20}
                  color="#FFF"
                />
              </View>
              <Text
                style={[
                  styles.settingText,
                  { color: textColor, fontSize: getFontSize(16) },
                ]}
              >
                Tema Escuro
              </Text>
            </View>
            <Switch
              value={isDarkTheme}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#D4AF37" }}
              thumbColor={isDarkTheme ? "#FFF" : "#f4f3f4"}
            />
          </View>

          {/* Idioma */}
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: cardColor }]}
            onPress={mudarIdioma}
          >
            <View style={styles.settingIconText}>
              <View style={[styles.iconBox, { backgroundColor: "#2D5AA0" }]}>
                <Ionicons name="language" size={20} color="#FFF" />
              </View>
              <Text
                style={[
                  styles.settingText,
                  { color: textColor, fontSize: getFontSize(16) },
                ]}
              >
                Idioma
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={[
                  styles.settingValueText,
                  { color: subTextColor, fontSize: getFontSize(14) },
                ]}
              >
                {idioma === "pt-BR" ? "Português" : "English"}
              </Text>
              <Ionicons
                name="sync"
                size={18}
                color="#D4AF37"
                style={{ marginLeft: 5 }}
              />
            </View>
          </TouchableOpacity>

          {/* NOVA SESSÃO: ACESSIBILIDADE */}
          <Text
            style={[
              styles.sectionTitle,
              { color: subTextColor, marginTop: 20, fontSize: getFontSize(12) },
            ]}
          >
            ACESSIBILIDADE
          </Text>

          <View style={[styles.settingRow, { backgroundColor: cardColor }]}>
            <View style={styles.settingIconText}>
              <View style={[styles.iconBox, { backgroundColor: "#4CAF50" }]}>
                <Ionicons name="text" size={20} color="#FFF" />
              </View>
              <Text
                style={[
                  styles.settingText,
                  { color: textColor, fontSize: getFontSize(16) },
                ]}
              >
                Fonte Ampliada
              </Text>
            </View>
            <Switch
              value={fonteMaior}
              onValueChange={toggleFonteMaior}
              trackColor={{ false: "#767577", true: "#D4AF37" }}
              thumbColor={fonteMaior ? "#FFF" : "#f4f3f4"}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: cardColor }]}>
            <View style={styles.settingIconText}>
              <View style={[styles.iconBox, { backgroundColor: "#FF9800" }]}>
                <Ionicons name="contrast" size={20} color="#FFF" />
              </View>
              <Text
                style={[
                  styles.settingText,
                  { color: textColor, fontSize: getFontSize(16) },
                ]}
              >
                Alto Contraste
              </Text>
            </View>
            <Switch
              value={altoContraste}
              onValueChange={toggleAltoContraste}
              trackColor={{ false: "#767577", true: "#D4AF37" }}
              thumbColor={altoContraste ? "#FFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out"
              size={22}
              color="#FF4444"
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.logoutText, { fontSize: getFontSize(16) }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DE EDIÇÃO */}
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 3,
  },
  avatarWrapper: { marginBottom: 15 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#D4AF37",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  editPhotoBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  nomeText: { fontWeight: "bold", marginBottom: 5 },
  bioText: { marginBottom: 10, textAlign: "center", paddingHorizontal: 20 },
  roleText: {
    color: "#D4AF37",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  editProfileBtn: {
    flexDirection: "row",
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  editProfileText: { color: "#0F0F0F", fontWeight: "bold" },
  settingsSection: { padding: 25 },
  sectionTitle: { fontWeight: "bold", letterSpacing: 1.5, marginBottom: 15 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  settingIconText: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingText: { fontWeight: "500" },
  settingValueText: {},
  footerSection: {
    flex: 1,
    alignItems: `center`,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FF444415",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 300,
    borderWidth: 1,
    borderColor: "#FF444430",
  },
  logoutText: { color: "#FF4444", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontWeight: "bold" },
  label: { textTransform: "uppercase", marginBottom: 8, fontWeight: "bold" },
  input: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  saveModalBtn: {
    backgroundColor: "#D4AF37",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveModalText: { color: "#0F0F0F", fontWeight: "bold" },
});
