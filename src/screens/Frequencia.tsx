import { Ionicons } from "@expo/vector-icons";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"; // 1. Adicionado useContext
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// 2. Importar o Contexto
import Toast from "react-native-toast-message";
import { AppContext } from "../context/AppContext";
import api from "../services/api";

export default function FrequenciaAluno({ route, navigation }: any) {
  // 3. Consumir acessibilidade
  const { fs, colors, t } = useContext(AppContext);

  const practitionerId = route?.params?.practitionerId;
  const initialHistorico = route?.params?.historico || [];

  const [historico, setHistorico] = useState<any[]>(initialHistorico);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttendances = useCallback(async () => {
    if (!practitionerId) return; // Se não houver ID, usa o histórico inicial
    try {
      setLoading(true);
      const { data } = await api.get(
        `/training-sessions/practitioner/${practitionerId}/record`,
      );

      
      setHistorico(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: err?.response?.data?.message || "Falha ao carregar histórico",
      });
    } finally {
      setLoading(false);
    }
  }, [practitionerId]);

  useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  const onRefresh = async () => {
    if (!practitionerId) return;
    setRefreshing(true);
    await loadAttendances();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const totalAulas = historico.length;
    const presencas = historico.filter(
      (item: any) => item.present === true,
    ).length;
    const faltas = totalAulas - presencas;
    const porcentagem =
      totalAulas > 0 ? Math.round((presencas / totalAulas) * 100) : 0;

    return { totalAulas, presencas, faltas, porcentagem };
  }, [historico]);

  const getColor = (p: any) => {
    if (p >= 75) return "#2ECC71";
    if (p >= 50) return "#F1C40F";
    return "#E74C3C";
  };

  const renderItem = ({ item }: { item: any }) => {
    let dateStr = item.TrainingSessionDate || item.date || item.data;
    if (Array.isArray(dateStr)) {
      const [y, m, d] = dateStr;
      dateStr = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
    } else if (typeof dateStr === "string" && dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return (
      <View style={styles.historyRow}>
        <View style={styles.dateInfo}>
          <Ionicons
            name={item.present ? "checkmark-circle" : "close-circle"}
            size={22}
            color={item.present ? "#2ECC71" : "#FF4444"}
          />
          {/* ACESSIBILIDADE: Data do Histórico */}
          <Text style={[styles.dateText, { fontSize: fs(16) }]}>{dateStr}</Text>
        </View>
        {/* ACESSIBILIDADE: Tag de Status */}
        <Text
          style={[
            styles.statusTag,
            {
              color: item.present ? "#2ECC71" : "#FF4444",
              fontSize: fs(11),
            },
          ]}
        >
          {item.present ? t.present : t.absent }
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel={"Voltar para a tela anterior"}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        {/* ACESSIBILIDADE: Título do Header */}
        <Text style={[styles.headerTitle, { fontSize: fs(18) }]}>
          { t.frequencyAnalysis }
        </Text>
      </View>

      <View style={styles.statusCard}>
        {/* ACESSIBILIDADE: Nome do Aluno */}
        <Text style={[styles.studentName, { fontSize: fs(24) }]}>
          { t.myFrequencyTitle }
        </Text>

        <Text style={[styles.statLabel, { fontSize: fs(12) }]}>
          { t.fullFrequency }
        </Text>

        {/* ACESSIBILIDADE: Valor da Porcentagem (Grande) */}
        <Text
          style={[
            styles.statValue,
            {
              color: getColor(stats.porcentagem),
              fontSize: fs(40),
            },
          ]}
        >
          {stats.porcentagem}%
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stats.porcentagem}%`,
                backgroundColor: getColor(stats.porcentagem),
              },
            ]}
          />
        </View>

        <View style={styles.miniStatsRow}>
          {/* ACESSIBILIDADE: Contadores de Presença/Falta */}
          <Text style={[styles.miniStatText, { fontSize: fs(12) }]}>
            { t.presenceLabel }: {stats.presencas}
          </Text>
          <Text style={[styles.miniStatText, { fontSize: fs(12) }]}>
            { t.absencesLabel }: {stats.faltas}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { fontSize: fs(14) }]}>
        { t.classesRecordLabel }
      </Text>

      {loading && !refreshing ? (
        <View
          style={{
            padding: 20,
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item: any, index) =>
            item.id ? item.id.toString() : `temp-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { fontSize: fs(14) }]}>
              Sem dados registrados
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { color: "#FFF", fontWeight: "bold", marginLeft: 20 },
  statusCard: {
    backgroundColor: "#1A1A1A",
    margin: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  studentName: { color: "#FFF", fontWeight: "800", marginBottom: 10 },
  statLabel: { color: "#888" },
  statValue: { fontWeight: "bold", marginTop: 5 },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#333",
    borderRadius: 10,
    marginTop: 15,
    overflow: "hidden",
  },
  progressFill: { height: "100%" },
  miniStatsRow: { flexDirection: "row", gap: 20, marginTop: 15 },
  miniStatText: { color: "#AAA", fontWeight: "bold" },
  sectionTitle: {
    color: "#D4AF37",
    fontWeight: "bold",
    marginLeft: 25,
    marginBottom: 15,
  },
  list: { paddingHorizontal: 20 },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#161616",
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
  },
  dateInfo: { flexDirection: "row", alignItems: "center" },
  dateText: { color: "#FFF", marginLeft: 12 },
  statusTag: { fontWeight: "bold" },
  emptyText: { color: "#555", textAlign: "center", marginTop: 20 },
});
