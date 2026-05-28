import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { User } from "../interfaces/user";
import api from "../services/api";

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

export default function Profile() {
  const navigation = useNavigation<NavigationProps>();

  const {
    isDark,
    toggleColorScheme,
    language,
    toggleLanguage,
    largeFonts,
    toggleLargeFonts,
    colors,
    highContrast,
    toggleHighContrast,
    fs,
    t,
    tc
  } = useContext(ThemeContext);

  const { logout, isMaster, user } = useContext(AuthContext);

  const [userSelected, setSelectedUser] = useState<User | null>(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function getUserProfile() {
    try {
      const response = await api.get("/users/profile");

      setSelectedUser(response.data);
    } catch (error: any) {
      console.log(error?.response?.data?.message ?? error?.message);
    }
  }

  useEffect(() => {
    getUserProfile();
  }, []);

  function abrirEdicao() {
    setName(userSelected?.name ?? "");
    setBio(userSelected?.bio ?? "");
    setModalVisible(true);
  }

  async function saveProfile() {
    try {
      setSavingProfile(true);

      await api.patch(
        `/users/${user?.id}`,
        {
          name, 
          bio,
        },
      );

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Usuário atualizado com sucesso!',
        position: 'top'
      });
      await getUserProfile();
      setModalVisible(false);
    } catch (error) {
            console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Falha',
        text2: 'Não foi possível atualizar o usuário. Tente novamente mais tarde',
        position: 'top'
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function updatePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) return;

      const image = result.assets[0];

      const formData = new FormData();

      formData.append(
        "file",
        {
          uri: image.uri,
          name: image.fileName ?? "profile.jpg",
          type: image.mimeType ?? "image/jpeg",
        } as any
      );

      setLoadingPhoto(true);

      await api.patch(`/users/${user?.id}/update-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Foto atualizada com sucesso!'
      })

      await getUserProfile();
    } catch (error) {
      console.log(error);
      
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível atualizar a foto'
      })
    } finally {
      setLoadingPhoto(false);
    }
  }

  function handleLogout() {
    setOpenLogoutDialog(true);
  }

  function handleDeleteAccount() {
    setOpenDeleteDialog(true);
  }

  async function confirmDeleteAccount() {
    setDeletingAccount(true);

    try {
      await api.delete(`/users/${user?.id}`);

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Conta deletada com sucesso',
        position: 'top'
      });

      setOpenDeleteDialog(false);
      logout();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error?.response?.data?.message || 'Não foi possível deletar a conta',
        position: 'top'
      });
      setOpenDeleteDialog(false);
    } finally {
      setDeletingAccount(false);
    }
  }

    const bgColor = colors.bg;
    const cardColor = colors.card;
    const textColor = colors.text;
    const subTextColor = tc(colors.textMuted);
    const inputBg = colors.inputBg;
  
  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={[styles.headerSection, { backgroundColor: cardColor }]}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              {userSelected?.profilePhoto ? (
                <Image
                  style={styles.avatarImage}
                  source={{
                    uri: userSelected.profilePhoto,
                  }}
                />
              ) : (
                <Ionicons name="person" size={50} color="#999" />
              )}

              {loadingPhoto && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color="#FFF" />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.editPhotoBadge}
              onPress={updatePhoto}
              accessibilityLabel={t.editPhoto ?? "Alterar foto de perfil"}
              accessibilityRole="button"
            >
              <Ionicons name="camera" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.nomeText,
              { color: textColor, fontSize: fs(24) },
            ]}
          >
            {userSelected?.name}
          </Text>

          <Text
            style={[
              styles.bioText,
              { color: subTextColor, fontSize: fs(14) },
            ]}
          >
            {userSelected?.bio || "Sem bio cadastrada"}
          </Text>

          <Text style={[styles.roleText, { fontSize: fs(13) }]}>
            {isMaster ? t.master : t.practitioner}
          </Text>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={abrirEdicao}
            accessibilityLabel={t.editProfile ?? "Editar perfil"}
            accessibilityRole="button"
          >
            <Ionicons
              name="pencil"
              size={16}
              color="#0F0F0F"
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.editProfileText,
                { fontSize: fs(14) },
              ]}
            >
              { t.editProfile }
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONFIGURAÇÕES */}
        <View style={styles.settingsSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: subTextColor, fontSize: fs(12) },
            ]}
          >
            { t.preferences }
          </Text>

          <View style={[styles.settingRow, { backgroundColor: cardColor }]}>
            <View style={styles.settingIconText}>
              <View style={[styles.iconBox, { backgroundColor: "#333" }]}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color="#FFF"
                />
              </View>

              <Text
                style={[
                  styles.settingText,
                  { color: textColor, fontSize: fs(16) },
                ]}
              >
                { t.darkTheme }
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleColorScheme}
              trackColor={{ false: "#767577", true: "#D4AF37" }}
              thumbColor={isDark ? "#FFF" : "#f4f3f4"}
              accessibilityLabel={t.darkTheme ?? "Tema escuro"}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: cardColor }]}
            onPress={toggleLanguage}
            accessibilityLabel={`${t.language ?? "Idioma"}: ${language === "en-US" ? t.portuguese : t.english}`}
            accessibilityRole="button"
          >
            <View style={styles.settingIconText}>
              <View style={[styles.iconBox, { backgroundColor: "#2D5AA0" }]}>
                <Ionicons name="language" size={20} color="#FFF" />
              </View>

              <Text
                style={[
                  styles.settingText,
                  { color: textColor, fontSize: fs(16) },
                ]}
              >
                { t.language }
              </Text>
            </View>

            <Text
              style={[
                styles.settingValueText,
                { color: subTextColor, fontSize: fs(14) },
              ]}
            >
              {language === "en-US" ? t.portuguese : t.english}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.sectionTitle,
              {
                color: subTextColor,
                marginTop: 20,
                fontSize: fs(12),
              },
            ]}
          >
            { t.accessibility }
          </Text>

          <View style={[styles.settingRow, { backgroundColor: cardColor }]}>
            <View style={styles.settingIconText}>
              <View style={[styles.iconBox, { backgroundColor: "#4CAF50" }]}>
                <Ionicons name="text" size={20} color="#FFF" />
              </View>

              <Text
                style={[
                  styles.settingText,
                  { color: textColor, fontSize: fs(16) },
                ]}
              >
                { t.largeFonts }
              </Text>
            </View>

            <Switch
              value={largeFonts}
              onValueChange={toggleLargeFonts}
              trackColor={{ false: "#767577", true: "#D4AF37" }}
              thumbColor={largeFonts ? "#FFF" : "#f4f3f4"}
              accessibilityLabel={t.largeFonts ?? "Fontes grandes"}
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
                  { color: textColor, fontSize: fs(16) },
                ]}
              >
                { t.highContrast }
              </Text>
            </View>

            <Switch
              value={highContrast}
              onValueChange={toggleHighContrast}
              trackColor={{ false: "#767577", true: "#D4AF37" }}
              thumbColor={highContrast ? "#FFF" : "#f4f3f4"}
              accessibilityLabel={t.highContrast ?? "Alto contraste"}
            />
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityLabel={t.logout ?? "Sair"}
            accessibilityRole="button"
          >
            <Ionicons
              name="log-out"
              size={22}
              color="#FF4444"
              style={{ marginRight: 10 }}
            />

            <Text
              style={[
                styles.logoutText,
                { fontSize: fs(16) },
              ]}
            >
             { t.logout }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            accessibilityLabel="Deletar conta"
            accessibilityRole="button"
          >
            <Ionicons
              name="trash"
              size={22}
              color="#FF0000"
              style={{ marginRight: 10 }}
            />

            <Text
              style={[
                styles.deleteAccountText,
                { fontSize: fs(16) },
              ]}
            >
              Deletar Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: cardColor },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: textColor, fontSize: fs(20) },
              ]}
            >
              Editar Perfil
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome"
              placeholderTextColor="#999"
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  color: textColor,
                },
              ]}
              accessibilityLabel="Nome"
            />

            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor="#999"
              multiline
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  color: textColor,
                  height: 100,
                },
              ]}
              accessibilityLabel="Bio"
            />

            <TouchableOpacity
              style={styles.saveModalBtn}
              onPress={saveProfile}
              accessibilityLabel="Salvar perfil"
              accessibilityRole="button"
            >
              {savingProfile ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.saveModalText}>Salvar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 15, alignItems: 'center' }}
              accessibilityLabel={t.cancel ?? "Cancelar"}
              accessibilityRole="button"
            >
              <Text style={{ color: "#FF4444" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja Deslogar?</AlertDialogTitle>

            <AlertDialogDescription>
              Você tem certeza disso?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancelar</Text>
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive"
              onPress={async () => {
                logout();
              }}
            >
              <Text className="color-white">Sim</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Conta?</AlertDialogTitle>

            <AlertDialogDescription>
              Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão deletados.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancelar</Text>
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive"
              onPress={confirmDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="color-white">Deletar</Text>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

  avatarWrapper: {
    marginBottom: 15,
    position: "relative",
  },

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

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  loadingOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#00000070",
    justifyContent: "center",
    alignItems: "center",
  },

  editPhotoBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#1A1A1A",
  },

  nomeText: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  bioText: {
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },

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

  editProfileText: {
    color: "#0F0F0F",
    fontWeight: "bold",
  },

  settingsSection: {
    padding: 25,
  },

  sectionTitle: {
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 15,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },

  settingIconText: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  settingText: {
    fontWeight: "500",
  },

  settingValueText: {},

  footerSection: {
    alignItems: "center",
    marginBottom: 30,
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

  logoutText: {
    color: "#FF4444",
    fontWeight: "bold",
  },

  deleteAccountButton: {
    flexDirection: "row",
    backgroundColor: "#FF000015",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 300,
    borderWidth: 1,
    borderColor: "#FF000030",
    marginTop: 12,
  },

  deleteAccountText: {
    color: "#FF0000",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  modalContent: {
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  modalTitle: {
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  saveModalBtn: {
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  saveModalText: {
    fontWeight: "bold",
    color: "#000",
  },
});