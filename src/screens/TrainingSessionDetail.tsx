import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

interface Attendance {
  practitionerId: number;
  present: boolean;
}

interface Practitioner {
  id: number;
  name: string;
  frequency: number;
}

interface TrainingSession {
  id: number;
  date: string;
  classGroupName: string;
  practitioners: Practitioner[];
}

export default function TrainingSessionDetail({ route, navigation }: any) {
  const {
    sessionId,
    sessionDate: initialDate,
    classGroupName: initialName,
    classGroupId,
  } = route.params;

  const [sessionData, setSessionData] = useState<TrainingSession | null>(null);

  const { fs, colors, t } = useTheme();

  // Estado local para armazenar as marcações em memória antes de salvar (batch)
  // practitionerId -> boolean (present/absent)
  const [localAttendances, setLocalAttendances] = useState<
    Record<number, boolean>
  >({});

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [practitioners, setPractitioners] = useState<Practitioner[] | null>(null);

  const loadPractitioners = async () => {
    try {
      const response = await api.get(`/class-groups/${classGroupId}/practitioners`);

      const data = response.data;

      setPractitioners(data);
    }catch(err: any) {

    }
  }

  const loadSessionDetails = useCallback(async () => {
    try {
      const [sessionRes, attendancesRes] = await Promise.all([
        api.get(`/training-sessions/${sessionId}`),
        api.get(`/training-sessions/${sessionId}/find-all-attendances`),
      ]);

      const data: TrainingSession = sessionRes.data;
      const attendances: Attendance[] = attendancesRes.data;

      setSessionData(data);

      const initialMap: Record<number, boolean> = {};

      attendances.forEach((attendance) => {
        initialMap[attendance.practitionerId] = attendance.present;
      });
      setLocalAttendances(initialMap);
    } catch (err: any) {
      console.log("ERRO GET SESSION:", err?.response?.data || err.message);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2:
          err?.response?.data?.message ||
          "Falha ao carregar detalhes da sessão",
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const loadData = useCallback(async () => {
    setLoading(true);
  
    try {
      await Promise.all([
        loadPractitioners(),
        loadSessionDetails(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadSessionDetails, classGroupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessionDetails();
    await loadPractitioners();
    setRefreshing(false);
  };

  

  function formatDateToBR(dateString: any) {
    if (!dateString) return "";
    if (Array.isArray(dateString)) {
      const [y, m, d] = dateString;
      return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
    }
    const parts = String(dateString).split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }


  // Apenas altera a memória local
  function toggleAttendance(practitionerId: number, present: boolean) {
    setLocalAttendances((prev) => ({
      ...prev,
      [practitionerId]: present,
    }));
  }

  // Envia todas as marcações de uma vez só (Batch)
  async function saveBatch() {
    const payloadAttendances = Object.entries(localAttendances).map(
      ([id, present]) => ({
        practitionerId: Number(id),
        present,
      }),
    );

    if (payloadAttendances.length === 0) {
      Toast.show({
        type: "info",
        text1: "Aviso",
        text2: "Nenhuma presença foi alterada.",
      });
      return;
    }

    setSaving(true);
    try {
      await api.post("/training-sessions/attendances/batch", {
        trainingSessionId: sessionId,
        attendances: payloadAttendances,
      });

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Lista de presenças salva com sucesso!",
      });

      // Recarrega os dados para ficar consistente com a base
      await loadData();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao salvar",
        text2:
          err?.response?.data?.message || "Não foi possível salvar a lista.",
      });
    } finally {
      setSaving(false);
    }
  }

  const renderItem = ({ item }: { item: Practitioner }) => {
    if (!sessionData) return null;

    const displayName = item.name || "Aluno sem nome";

    // Lê a informação do dicionário em memória
    const isPresent = localAttendances[item.id] === true;
    const isAbsent = localAttendances[item.id] === false;

    return (
      <View
        style={[
          styles.card,
          isPresent && styles.cardPresent,
          isAbsent && styles.cardAbsent,
          { backgroundColor: colors.card, borderColor: colors.cardBorder }
        ]}
      >
        <View style={styles.cardInfo}>
          <Text style={[styles.studentName, { fontSize: fs(15), color: colors.text}]}>{displayName}</Text>
          <Text style={[styles.frequency, { fontSize: fs(15), color: colors.text}]}>
            {t.fullFrequency}: {Math.round(item.frequency)}%
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              { backgroundColor: colors.bg},
              isAbsent && { backgroundColor: "#FF4444" },
            ]}
            onPress={() => toggleAttendance(item.id, false)}
          >
            <Ionicons
              name={isAbsent ? "close-circle" : "close-circle-outline"}
              size={fs(24)}
              color={isAbsent ? "#FFF" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBtn,
              { backgroundColor: colors.bg},
              isPresent && { backgroundColor: "#2ECC71" },

            ]}
            onPress={() => toggleAttendance(item.id, true)}
          >
            <Ionicons
              name={isPresent ? "checkmark-circle" : "checkmark-circle-outline"}
              size={fs(24)}
              color={isPresent ? "#0F0F0F" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const displayGroupName = sessionData?.classGroupName || initialName;
  const displayDate = sessionData?.date || initialDate;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg}]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder}]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bg}]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.accent}/>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { fontSize: fs(20), color: colors.text}]}>{displayGroupName}</Text>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={12} color="#D4AF37" />
            <Text style={[styles.dateText, { fontSize: fs(14), color: colors.text}]}>{formatDateToBR(displayDate)}</Text>
          </View>
        </View>

        <View style={{ width: 42 }} />
      </View>

      {/* CONTEÚDO */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={
            practitioners
          }
          keyExtractor={(item) =>
            item.id.toString()!
          }
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={54} color="#333" />
              <Text style={[styles.emptyText, { fontSize: fs(15)}]}>
                Nenhum aluno cadastrado nesta turma.
              </Text>
            </View>
          )}
        />
      )}

      {/* BARRA INFERIOR DE SALVAR (APENAS SE HOUVER ALUNOS) */}
      {!loading && practitioners?.length ? (
        <View style={[styles.bottomBar, { backgroundColor: colors.bg, borderTopColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[styles.saveBatchBtn]}
            activeOpacity={0.8}
            onPress={saveBatch}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#0F0F0F" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#0F0F0F" />
                <Text style={[styles.saveBatchText, { fontSize: fs(15)}]}>SALVAR LISTA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#161616",
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#151515",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF3720",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    gap: 6,
  },
  dateText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 18,
    paddingBottom: 100, // Espaço extra para a barra inferior
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#141414",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  cardPresent: {
    borderLeftWidth: 4,
    borderLeftColor: "#2ECC71",
  },
  cardAbsent: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF4444",
  },
  cardInfo: {
    flex: 1,
  },
  studentName: {
    color: "#FFF",
    fontWeight: "700",
  },
  frequency: {
    color: "#888",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1D1D1D",
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#666",
    marginTop: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "#161616",
  },
  saveBatchBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBatchText: {
    color: "#0F0F0F",
    fontWeight: "900",
    letterSpacing: 1,
  },
});
