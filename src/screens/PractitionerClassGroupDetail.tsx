import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Attendances } from "../interfaces/practitioner";

const { width } = Dimensions.get("window");

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ClassGroupInfo {
  id: number;
  name: string;
  countPractitioners: number;
}

type TabKey = "overview" | "frequency";

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  const { fs } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color, fontSize: fs(22) }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { fontSize: fs(11) }]}>{label}</Text>
    </View>
  );
}

// ─── FREQUENCY ROW ────────────────────────────────────────────────────────────

function FrequencyRow({ item }: { item: Attendances }) {
  const { colors, fs } = useTheme();
  const isPresent = item.present === true;

  return (
    <View
      style={[
        styles.freqRow,
        {
          backgroundColor: colors.card,
          borderLeftColor: isPresent ? colors.success : colors.danger,
        },
      ]}
    >
      <View style={styles.freqRowLeft}>
        <View
          style={[
            styles.freqDot,
            { backgroundColor: isPresent ? colors.success : colors.danger },
          ]}
        />
        <Text style={[styles.freqDate, { color: colors.text, fontSize: fs(15) }]}>
          {item.date}
        </Text>
      </View>
      <View
        style={[
          styles.freqBadge,
          {
            backgroundColor: isPresent
              ? colors.success + "20"
              : colors.danger + "20",
          },
        ]}
      >
        <Text
          style={[
            styles.freqBadgeText,
            {
              color: isPresent ? colors.success : colors.danger,
              fontSize: fs(11),
            },
          ]}
        >
          {isPresent ? "PRESENTE" : "FALTA"}
        </Text>
      </View>
    </View>
  );
}

// ─── SCREEN ───────────────────────────────────────────────────────────────────

export default function PractitionerClassGroupDetail({ route, navigation }: any) {
  const { classGroupId, classGroupName } = route.params;
  const { colors, fs } = useTheme();
  const { token, user } = useContext(AuthContext);

  const [classInfo, setClassInfo] = useState<ClassGroupInfo | null>(null);
  const [attendances, setAttendances] = useState<Attendances[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // ─── FETCH ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      // Busca info da turma
      const [classRes, attendRes] = await Promise.all([
        api.get(`/class-groups/${classGroupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(
          `/class-groups/${classGroupId}/practitioners/${user?.id}/attendances`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      setClassInfo(classRes.data);
      setAttendances(attendRes.data ?? []);
    } catch (err: any) {
      console.log("PractitionerClassGroupDetail error:", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [classGroupId, token, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // ─── STATS ──────────────────────────────────────────────────────────────────

  const totalClasses = attendances.length;
  const presences = attendances.filter((a) => a.present === true).length;
  const absences = totalClasses - presences;
  const pct = totalClasses > 0 ? Math.round((presences / totalClasses) * 100) : 0;

  const pctColor =
    pct >= 75 ? colors.success : pct >= 50 ? colors.warning : colors.danger;

  // ─── LOADING ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── TABS ────────────────────────────────────────────────────────────────────

  const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "overview", label: "Turma", icon: "people-outline" },
    { key: "frequency", label: "Frequência", icon: "stats-chart-outline" },
  ];

  // ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

  const OverviewContent = () => (
    <View style={styles.overviewContainer}>
      {/* Card principal da turma */}
      <View style={[styles.classHeroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.classHeroTop}>
          <View style={[styles.classIconBox, { backgroundColor: colors.accent + "20" }]}>
            <Ionicons name="people" size={28} color={colors.accent} />
          </View>
          <View style={[styles.enrolledBadge, { backgroundColor: colors.accent + "20", borderColor: colors.accent + "40" }]}>
            <Ionicons name="checkmark-circle" size={12} color={colors.accent} />
            <Text style={[styles.enrolledBadgeText, { color: colors.accent, fontSize: fs(11) }]}>
              INSCRITO
            </Text>
          </View>
        </View>

        <Text style={[styles.classHeroName, { color: colors.text, fontSize: fs(24) }]}>
          {classGroupName}
        </Text>

        <View style={styles.classHeroDivider} />

        <View style={styles.classHeroMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={15} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted, fontSize: fs(13) }]}>
              {classInfo?.countPractitioners ?? "–"} alunos matriculados
            </Text>
          </View>
        </View>
      </View>

      {/* Resumo de frequência no overview */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.summaryTitle, { color: colors.textMuted, fontSize: fs(11) }]}>
          SEU APROVEITAMENTO
        </Text>

        <View style={styles.summaryPctRow}>
          <Text style={[styles.summaryPct, { color: pctColor, fontSize: fs(48) }]}>
            {pct}
          </Text>
          <Text style={[styles.summaryPctSymbol, { color: pctColor, fontSize: fs(20) }]}>%</Text>
        </View>

        {/* Barra de progresso */}
        <View style={[styles.progressBar, { backgroundColor: colors.cardBorder }]}>
          <View
            style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pctColor }]}
          />
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatNum, { color: colors.success, fontSize: fs(18) }]}>
              {presences}
            </Text>
            <Text style={[styles.summaryStatLabel, { color: colors.textMuted, fontSize: fs(11) }]}>
              Presenças
            </Text>
          </View>
          <View style={[styles.summaryStatDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatNum, { color: colors.danger, fontSize: fs(18) }]}>
              {absences}
            </Text>
            <Text style={[styles.summaryStatLabel, { color: colors.textMuted, fontSize: fs(11) }]}>
              Faltas
            </Text>
          </View>
          <View style={[styles.summaryStatDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatNum, { color: colors.accent, fontSize: fs(18) }]}>
              {totalClasses}
            </Text>
            <Text style={[styles.summaryStatLabel, { color: colors.textMuted, fontSize: fs(11) }]}>
              Total
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.freqBtn, { backgroundColor: colors.accent }]}
        onPress={() => setActiveTab("frequency")}
      >
        <Ionicons name="list-outline" size={18} color={colors.accentForeground} />
        <Text style={[styles.freqBtnText, { color: colors.accentForeground, fontSize: fs(14) }]}>
          Ver histórico completo
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── FREQUENCY TAB ──────────────────────────────────────────────────────────

  const FrequencyContent = () => (
    <View style={styles.freqContainer}>
      {attendances.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted, fontSize: fs(15) }]}>
            Nenhuma aula registrada
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...attendances].reverse()}
          keyExtractor={(item, i) => `${item.id ?? i}`}
          renderItem={({ item }) => <FrequencyRow item={item} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.accent} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(17) }]}>
            {classGroupName}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted, fontSize: fs(11) }]}>
            Detalhes da Turma
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* TABS */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                active && { borderBottomColor: colors.accent },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={active ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active ? colors.accent : colors.textMuted,
                    fontSize: fs(13),
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CONTENT */}
      <FlatList
        data={[]}
        keyExtractor={() => "empty"}
        renderItem={null}
        ListHeaderComponent={
          activeTab === "overview" ? <OverviewContent /> : <FrequencyContent />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontWeight: "800" },
  headerSub: { marginTop: 2 },

  // TABS
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontWeight: "600" },

  // SCROLL
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  // OVERVIEW
  overviewContainer: { gap: 16 },

  classHeroCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
  },
  classHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  classIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  enrolledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  enrolledBadgeText: { fontWeight: "700", letterSpacing: 0.5 },
  classHeroName: { fontWeight: "900", marginBottom: 16 },
  classHeroDivider: { height: 1, backgroundColor: "#252525", marginBottom: 14 },
  classHeroMeta: { gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: {},

  // SUMMARY CARD
  summaryCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    alignItems: "center",
  },
  summaryTitle: { letterSpacing: 1.5, fontWeight: "700", marginBottom: 8 },
  summaryPctRow: { flexDirection: "row", alignItems: "flex-end" },
  summaryPct: { fontWeight: "900", lineHeight: 52 },
  summaryPctSymbol: { fontWeight: "700", marginBottom: 8, marginLeft: 2 },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 16,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  summaryStatItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryStatNum: { fontWeight: "800" },
  summaryStatLabel: { letterSpacing: 0.5 },
  summaryStatDivider: { width: 1, height: 36 },

  // FREQ BUTTON
  freqBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  freqBtnText: { fontWeight: "700" },

  // STAT CARD
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontWeight: "800" },
  statLabel: { color: "#888", textAlign: "center" },

  // FREQUENCY TAB
  freqContainer: { gap: 10 },

  freqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  freqRowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  freqDot: { width: 8, height: 8, borderRadius: 4 },
  freqDate: { fontWeight: "600" },
  freqBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  freqBadgeText: { fontWeight: "700", letterSpacing: 0.5 },

  // EMPTY
  emptyContainer: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: {},
});