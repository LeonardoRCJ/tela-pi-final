import { Ionicons } from "@expo/vector-icons";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

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

import Toast from "react-native-toast-message";

import { AppContext } from "../context/AppContext";
import api from "../services/api";

export default function Frequency({
  route,
  navigation,
}: any) {
  const { fs, colors, t, isDark } =
    useContext(AppContext);

  const practitionerId =
    route?.params?.practitionerId;

  const initialHistorico =
    route?.params?.historico || [];

  const [historico, setHistorico] =
    useState<any[]>(initialHistorico);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadAttendances = useCallback(
    async () => {
      if (!practitionerId) return;

      try {
        setLoading(true);

        const { data } = await api.get(
          `/training-sessions/practitioner/${practitionerId}/record`
        );

        setHistorico(data);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2:
            err?.response?.data?.message ||
            "Falha ao carregar histórico",
        });
      } finally {
        setLoading(false);
      }
    },
    [practitionerId]
  );

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
      (item: any) => item.present === true
    ).length;

    const faltas =
      totalAulas - presencas;

    const porcentagem =
      totalAulas > 0
        ? Math.round(
            (presencas / totalAulas) * 100
          )
        : 0;

    return {
      totalAulas,
      presencas,
      faltas,
      porcentagem,
    };
  }, [historico]);

  const getColor = (p: number) => {
    if (p >= 75) return colors.success;

    if (p >= 50) return colors.warning;

    return colors.danger;
  };

  const accentSoft = isDark
    ? `${colors.accent}18`
    : `${colors.accent}28`;

  const renderItem = ({
    item,
  }: {
    item: any;
  }) => {
    let dateStr =
      item.TrainingSessionDate ||
      item.date ||
      item.data;

    if (Array.isArray(dateStr)) {
      const [y, m, d] = dateStr;

      dateStr = `${String(d).padStart(
        2,
        "0"
      )}/${String(m).padStart(
        2,
        "0"
      )}/${y}`;
    } else if (
      typeof dateStr === "string" &&
      dateStr.includes("-")
    ) {
      const parts = dateStr.split("-");

      if (parts.length === 3) {
        dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    return (
      <View
        style={[
          styles.historyRow,
          {
            backgroundColor: colors.card,
            borderColor:
              colors.cardBorder,
          },
        ]}
      >
        <View style={styles.dateInfo}>
          <Ionicons
            name={
              item.present
                ? "checkmark-circle"
                : "close-circle"
            }
            size={22}
            color={
              item.present
                ? colors.success
                : colors.danger
            }
          />

          <Text
            style={[
              styles.dateText,
              {
                color: colors.text,
                fontSize: fs(15),
              },
            ]}
          >
            {dateStr}
          </Text>
        </View>

        <Text
          style={[
            styles.statusTag,
            {
              color: item.present
                ? colors.success
                : colors.danger,

              fontSize: fs(12),
            },
          ]}
        >
          {item.present
            ? t.present
            : t.absent}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <View
        style={[
          styles.glow1,
          {
            backgroundColor:
              accentSoft,
          },
        ]}
      />

      <View
        style={[
          styles.glow2,
          {
            backgroundColor:
              accentSoft,
          },
        ]}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.accent}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontSize: fs(18),
            },
          ]}
        >
          {t.frequencyAnalysis}
        </Text>
      </View>

      <View
        style={[
          styles.statusCard,
          {
            backgroundColor:
              colors.card,
            borderColor:
              colors.cardBorder,
            shadowColor:
              colors.accent,
          },
        ]}
      >
        <Text
          style={[
            styles.studentName,
            {
              color: colors.text,
              fontSize: fs(24),
            },
          ]}
        >
          {t.myFrequencyTitle}
        </Text>

        <Text
          style={[
            styles.statLabel,
            {
              color:
                colors.textMuted,
              fontSize: fs(13),
            },
          ]}
        >
          {t.fullFrequency}
        </Text>

        <Text
          style={[
            styles.statValue,
            {
              color: getColor(
                stats.porcentagem
              ),
              fontSize: fs(42),
            },
          ]}
        >
          {stats.porcentagem}%
        </Text>

        <View
          style={[
            styles.progressBar,
            {
              backgroundColor:
                colors.inputBg,
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${stats.porcentagem}%`,
                backgroundColor:
                  getColor(
                    stats.porcentagem
                  ),
              },
            ]}
          />
        </View>

        <View style={styles.miniStatsRow}>
          <View
            style={[
              styles.miniStatCard,
              {
                backgroundColor:
                  colors.bgSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.miniStatNumber,
                {
                  color:
                    colors.success,
                  fontSize: fs(16),
                },
              ]}
            >
              {stats.presencas}
            </Text>

            <Text
              style={[
                styles.miniStatLabel,
                {
                  color:
                    colors.textMuted,
                  fontSize: fs(11),
                },
              ]}
            >
              {t.presenceLabel}
            </Text>
          </View>

          <View
            style={[
              styles.miniStatCard,
              {
                backgroundColor:
                  colors.bgSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.miniStatNumber,
                {
                  color:
                    colors.danger,
                  fontSize: fs(16),
                },
              ]}
            >
              {stats.faltas}
            </Text>

            <Text
              style={[
                styles.miniStatLabel,
                {
                  color:
                    colors.textMuted,
                  fontSize: fs(11),
                },
              ]}
            >
              {t.absencesLabel}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.accent,
            fontSize: fs(14),
          },
        ]}
      >
        {t.classesRecordLabel}
      </Text>

      {loading && !refreshing ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={colors.accent}
          />
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(
            item: any,
            index
          ) =>
            item.id
              ? item.id.toString()
              : `temp-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={
            styles.list
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              tintColor={
                colors.accent
              }
            />
          }
          ListEmptyComponent={
            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.textMuted,
                  fontSize: fs(14),
                },
              ]}
            >
              Sem dados registrados
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  glow1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 200,
    top: -60,
    right: -80,
  },

  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 200,
    bottom: -40,
    left: -60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 12,
  },

  headerTitle: {
    fontWeight: "800",
    marginLeft: 18,
  },

  statusCard: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
    padding: 28,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  studentName: {
    fontWeight: "900",
    marginBottom: 8,
  },

  statLabel: {},

  statValue: {
    fontWeight: "900",
    marginTop: 8,
  },

  progressBar: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 18,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  miniStatsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 22,
  },

  miniStatCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: "center",
    minWidth: 110,
  },

  miniStatNumber: {
    fontWeight: "900",
  },

  miniStatLabel: {
    marginTop: 4,
    fontWeight: "600",
  },

  sectionTitle: {
    fontWeight: "800",
    marginLeft: 24,
    marginBottom: 14,
    letterSpacing: 1,
  },

  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  historyRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },

  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateText: {
    marginLeft: 12,
    fontWeight: "600",
  },

  statusTag: {
    fontWeight: "800",
    letterSpacing: 1,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});