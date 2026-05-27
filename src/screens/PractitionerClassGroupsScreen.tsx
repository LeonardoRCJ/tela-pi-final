import { Ionicons } from "@expo/vector-icons";
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SimpleClassGroup } from "../interfaces/classgroup";
import api from "../services/api";

/* =========================
   TYPES
========================= */

type RootStackParamList = {
  Main: { screen?: string };
  DetalheTurma: { classGroupId: number; classGroupName: string };
  FrequenciaAluno: { practitionerId?: number | number; alunoNome?: string };
  QrScanner: undefined;
  Entrar: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

/* ========================= */

export default function PractitionerClassGroups() {
  const navigation = useNavigation<NavigationProps>();

  const { t, fs, colors } = useTheme();
  const { user } = useContext(AuthContext);

  const [classGroup, setClassGroup] = useState<SimpleClassGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* =========================
     FETCH
  ========================= */

  const getMyClassGroup = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/class-groups/my");

      // Aceita tanto objeto único quanto array com um item
      const data = response.data;
      if (Array.isArray(data)) {
        setClassGroup(data.length > 0 ? data[0] : null);
      } else {
        setClassGroup(data ?? null);
      }

      console.log(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      // 404 significa que o praticante não está em nenhuma turma
      if (status === 404) {
        setClassGroup(null);
      } else {
        console.log("Erro ao buscar turma:", err?.response?.data?.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Recarrega sempre que a tela ganha foco (ex: voltando do QrScanner)
  useFocusEffect(
    useCallback(() => {
      getMyClassGroup();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getMyClassGroup();
    setRefreshing(false);
  }, []);

  /* =========================
     LEAVE
  ========================= */

  const handleLeave = () => {
    if (!classGroup?.id) return;

    Alert.alert(
      "Sair da Turma",
      `Tem certeza que deseja sair de "${classGroup.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(
                `/class-groups/${classGroup.id}/practitioners/${user.id}/remove`,
              );
              setClassGroup(null);
            } catch (err: any) {
              console.log("Erro ao sair:", err?.response?.data?.message);
              Alert.alert("Erro", "Não foi possível sair da turma.");
            }
          },
        },
      ],
    );
  };

  /* =========================
     LOADING
  ========================= */

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder}]}>
          <View>
            <Text style={[styles.headerTitle, { fontSize: fs(24) }]}>
              { t.myClass }
            </Text>
            <Text style={[styles.headerSubtitle, { fontSize: fs(12) }]}>
              { t.myClassSubtitle }
            </Text>
          </View>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  /* =========================
     UI — SEM TURMA
  ========================= */

  if (!classGroup) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { fontSize: fs(24), color: colors.text }]}>
              { t.myClass }
            </Text>
            <Text style={[styles.headerSubtitle, { fontSize: fs(12) }]}>
              {
                t.myClassSubtitle
              }
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
              colors={["#D4AF37"]}
            />
          }
        >
          <View style={[styles.emptyContainer, { backgroundColor: colors.bg}]}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="school-outline" size={52} color="#D4AF37" />
            </View>

            <Text style={[styles.emptyTitle, { fontSize: fs(20) }]}>
              Você não está em{"\n"}nenhuma turma
            </Text>

            <Text style={[styles.emptySubtitle, { fontSize: fs(14) }]}>
              Peça ao seu professor o{"\n"}QR Code para entrar.
            </Text>

            <TouchableOpacity
              style={styles.scanButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("QrScanner")}
              accessibilityLabel="Escanear QR Code"
              accessibilityRole="button"
            >
              <Ionicons
                name="qr-code-outline"
                size={22}
                color="#0F0F0F"
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.scanButtonText, { fontSize: fs(15) }]}>
                Escanear QR Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.codeButton}
              activeOpacity={0.7}
              onPress={() =>
                navigation.dispatch(CommonActions.navigate("Entrar"))
              }
              accessibilityLabel="Digitar código manualmente"
              accessibilityRole="button"
            >
              <Text style={[styles.codeButtonText, { fontSize: fs(14) }]}>
                Digitar código manualmente
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* =========================
     UI — COM TURMA
  ========================= */

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.bgSecondary}]}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: fs(24), color: colors.text }]}>
            {t.myClass}
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: fs(12), color: colors.textMuted }]}>
            { t.myClassSubtitle }
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={ {flexGrow: 1, padding: 24, backgroundColor: colors.bg}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
            colors={["#D4AF37"]}
          />
        }
      >
        {/* CARD DA TURMA */}
        <View style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.cardBorder}]}>
          <View style={styles.classCardIconRow}>
            <View style={[styles.classIconBox, { backgroundColor: colors.bgSecondary}]}>
              <Ionicons name="people" size={28} color="#D4AF37" />
            </View>

            <View style={[styles.classCardBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.badgeText, { fontSize: fs(11), color: colors.text }]}>
                { t.enrolled }
              </Text>
            </View>
          </View>

          <Text style={[styles.className, { fontSize: fs(22), color: colors.text }]}>
            {classGroup.name}
          </Text>

          <View style={[styles.divider, { borderColor: colors.cardBorder}]} />

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={colors.text} />
            <Text
              style={[styles.infoText, { fontSize: fs(14), color: colors.textMuted }]}
            >
              {classGroup.countPractitioners || 0} {""} {t.enrolleds }
            </Text>
          </View>
        </View>

        {/* BOTÃO DETALHES */}
        <TouchableOpacity
          style={styles.detailsButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate("FrequenciaAluno", {
                practitionerId: classGroup.practitionerId,
                alunoNome: "Minha Frequência",
              }),
            )
          }
          accessibilityLabel={t.myFrequency ?? "Minha frequência"}
          accessibilityRole="button"
        >
          <Ionicons
            name="stats-chart-outline"
            size={20}
            color="#0F0F0F"
            style={{ marginRight: 10 }}
          />
          <Text style={[styles.detailsButtonText, { fontSize: fs(15) }]}>
            { t.myFrequency}
          </Text>
        </TouchableOpacity>

        {/* BOTÃO SAIR */}
        <TouchableOpacity
          style={styles.leaveButton}
          activeOpacity={0.7}
          onPress={handleLeave}
          accessibilityLabel={t.leaveClassTitle ?? "Sair da turma"}
          accessibilityRole="button"
        >
          <Ionicons
            name="exit-outline"
            size={20}
            color="#FF4444"
            style={{ marginRight: 10 }}
          />
          <Text style={[styles.leaveButtonText, { fontSize: fs(15) }]}>
            { t.leaveClassTitle }
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },

  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },

  headerTitle: {
    color: "#FFF",
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#D4AF37",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* EMPTY STATE */

  emptyScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },

  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  emptyTitle: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 30,
  },

  emptySubtitle: {
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },

  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 36,
  },

  scanButtonText: {
    color: "#0F0F0F",
    fontWeight: "bold",
  },

  codeButton: {
    marginTop: 18,
    paddingVertical: 8,
  },

  codeButtonText: {
    color: "#555",
    textDecorationLine: "underline",
  },

  /* CLASS CARD */

  classCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
    marginBottom: 20,
  },

  classCardIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  classIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
  },

  classCardBadge: {
    backgroundColor: "#D4AF3720",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D4AF3750",
  },

  badgeText: {
    color: "#D4AF37",
    fontWeight: "bold",
    letterSpacing: 1,
  },

  className: {
    color: "#FFF",
    fontWeight: "900",
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#252525",
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoText: {
    color: "#666",
  },

  /* BUTTONS */

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  detailsButtonText: {
    color: "#0F0F0F",
    fontWeight: "bold",
  },

  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF444415",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF444430",
  },

  leaveButtonText: {
    color: "#FF4444",
    fontWeight: "bold",
  },
});
