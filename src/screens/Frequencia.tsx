import React, { useMemo, useContext } from "react"; // 1. Adicionado useContext
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 2. Importar o Contexto
import { AppContext } from "../context/AppContext";
import { Attendances } from "../interfaces/practitioner";

export default function FrequenciaAluno({ route, navigation }: any) {
  // 3. Consumir acessibilidade
  const { fs, colors } = useContext(AppContext);

  const alunoName = route?.params?.alunoNome || "Aluno";
  const historico = route?.params?.historico || [];

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

  const renderItem = ({ item }:{item: Attendances}) => (
    <View style={styles.historyRow}>
      <View style={styles.dateInfo}>
        <Ionicons
          name={item.present ? "checkmark-circle" : "close-circle"}
          size={22}
          color={item.present ? "#2ECC71" : "#FF4444"}
        />
        {/* ACESSIBILIDADE: Data do Histórico */}
        <Text style={[styles.dateText, { fontSize: fs(16) }]}>
          {item.date}
        </Text>
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
        {item.present ? "PRESENTE" : "FALTA"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        {/* ACESSIBILIDADE: Título do Header */}
        <Text style={[styles.headerTitle, { fontSize: fs(18) }]}>
          Análise de Frequência
        </Text>
      </View>

      <View style={styles.statusCard}>
        {/* ACESSIBILIDADE: Nome do Aluno */}
        <Text style={[styles.studentName, { fontSize: fs(24) }]}>
          {alunoName}
        </Text>

        <Text style={[styles.statLabel, { fontSize: fs(12) }]}>
          Aproveitamento Total
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
            Presenças: {stats.presencas}
          </Text>
          <Text style={[styles.miniStatText, { fontSize: fs(12) }]}>
            Faltas: {stats.faltas}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { fontSize: fs(14) }]}>
        Histórico de Aulas
      </Text>

      <FlatList
        data={historico}
        keyExtractor={(item) => item.id?.toString()!}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { fontSize: fs(14) }]}>
            Sem dados registrados
          </Text>
        }
      />
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
