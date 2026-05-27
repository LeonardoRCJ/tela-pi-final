import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

interface Visitant {
  id: string;
  name: string;
  phone: string;
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

  const { fs, colors, t } = useTheme();

  const [sessionData, setSessionData] =
    useState<TrainingSession | null>(null);

  const [localAttendances, setLocalAttendances] = useState<
    Record<number, boolean>
  >({});

  const [visitants, setVisitants] = useState<Visitant[]>([]);
  const [practitioners, setPractitioners] = useState<
    Practitioner[] | null
  >(null);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [visitantName, setVisitantName] = useState("");
  const [visitantPhone, setVisitantPhone] = useState("");

  const displayGroupName =
    sessionData?.classGroupName || initialName;

  const displayDate = sessionData?.date || initialDate;

  const loadPractitioners = async () => {
    try {
      const response = await api.get(
        `/class-groups/${classGroupId}/practitioners`
      );

      setPractitioners(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadVisitants = async () => {
    try {
      const sessionDate = displayDate;
      const response = await api.get(
        `/visitants/${sessionDate}/all`
      );

      setVisitants(response.data);
    } catch (err) {
      console.log(err);
    }
  };

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
        initialMap[attendance.practitionerId] =
          attendance.present;
      });

      setLocalAttendances(initialMap);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2:
          err?.response?.data?.message ||
          t.loadSessionError,
      });
    }
  }, [sessionId]);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      await Promise.all([
        loadPractitioners(),
        loadSessionDetails(),
        loadVisitants(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadSessionDetails]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);

    await loadData();

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

  function toggleAttendance(
    practitionerId: number,
    present: boolean
  ) {
    setLocalAttendances((prev) => ({
      ...prev,
      [practitionerId]: present,
    }));
  }

  async function saveBatch() {
    const payloadAttendances = Object.entries(
      localAttendances
    ).map(([id, present]) => ({
      practitionerId: Number(id),
      present,
    }));

    if (payloadAttendances.length === 0) {
      Toast.show({
        type: "info",
        text1: t.toastWarning,
        text2: t.noAttendanceChanges,
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
        text1: t.toastSuccess,
        text2: t.attendanceSaved,
      });

      await loadData();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2:
          err?.response?.data?.message ||
          t.saveAttendanceErrorBody,
      });
    } finally {
      setSaving(false);
    }
  }

  async function createVisitant() {
    try {
      if (!visitantName || !visitantPhone) {
        Toast.show({
          type: "info",
          text1: t.fillAllFields,
        });

        return;
      }

      await api.post("/visitants", {
        name: visitantName,
        phone: visitantPhone,
        sessionDate: displayDate,
      });

      Toast.show({
        type: "success",
        text1: t.visitantCreatedTitle,
      });

      setVisitantName("");
      setVisitantPhone("");

      setModalVisible(false);

      await loadVisitants();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.visitantErrorTitle,
        text2:
          err?.response?.data?.message ||
          t.visitantErrorMessage,
      });
    }
  }

  const stats = useMemo(() => {
    const total = practitioners?.length || 0;

    const presentes = Object.values(
      localAttendances
    ).filter(Boolean).length;

    return {
      total,
      presentes,
    };
  }, [practitioners, localAttendances]);

  const renderItem = ({
    item,
  }: {
    item: Practitioner;
  }) => {
    const isPresent = localAttendances[item.id] === true;

    const isAbsent = localAttendances[item.id] === false;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
          isPresent && {
            borderLeftColor: colors.success,
          },
          isAbsent && {
            borderLeftColor: colors.danger,
          },
        ]}
      >
        <View style={styles.cardInfo}>
          <Text
            style={[
              styles.studentName,
              {
                color: colors.text,
                fontSize: fs(15),
              },
            ]}
          >
            {item.name}
          </Text>

          <Text
            style={[
              styles.frequency,
              {
                color: colors.textMuted,
                fontSize: fs(12),
              },
            ]}
          >
            {t.frequency}: {Math.round(item.frequency)}%
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.statusBtn,
              {
                backgroundColor: isAbsent
                  ? colors.danger
                  : colors.bgSecondary,
              },
            ]}
            onPress={() =>
              toggleAttendance(item.id, false)
            }
          >
            <Ionicons
              name={
                isAbsent
                  ? "close-circle"
                  : "close-circle-outline"
              }
              size={22}
              color={isAbsent ? "#FFF" : colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBtn,
              {
                backgroundColor: isPresent
                  ? colors.success
                  : colors.bgSecondary,
              },
            ]}
            onPress={() =>
              toggleAttendance(item.id, true)
            }
          >
            <Ionicons
              name={
                isPresent
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={22}
              color={isPresent ? "#FFF" : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVisitant = ({
    item,
  }: {
    item: Visitant;
  }) => {
    return (
      <View
        style={[
          styles.visitantCard,
          {
            backgroundColor: colors.card,
            borderColor: `${colors.accent}55`,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.visitantHeader}>
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={colors.accent}
            />

            <Text
              style={[
                styles.visitantBadge,
                {
                  color: colors.accent,
                  fontSize: fs(10),
                },
              ]}
            >
              {t.visitantBadge}
            </Text>
          </View>

          <Text
            style={[
              styles.studentName,
              {
                color: colors.text,
                fontSize: fs(15),
              },
            ]}
          >
            {item.name}
          </Text>

          <Text
            style={[
              styles.frequency,
              {
                color: colors.textMuted,
                fontSize: fs(12),
              },
            ]}
          >
            {item.phone}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: colors.bg },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.bgSecondary,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.accent}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: fs(18),
              },
            ]}
          >
            {displayGroupName}
          </Text>

          <View
            style={[
              styles.dateBadge,
              {
                backgroundColor: `${colors.accent}20`,
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={12}
              color={colors.accent}
            />

            <Text
              style={[
                styles.dateText,
                {
                  color: colors.accent,
                  fontSize: fs(12),
                },
              ]}
            >
              {formatDateToBR(displayDate)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: colors.accent,
            },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons
            name="person-add-outline"
            size={20}
            color={colors.accentForeground}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.accent}
          />
        </View>
      ) : (
        <FlatList
          data={practitioners || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          ListHeaderComponent={
            <>
              <View style={styles.stats}>
                <Text
                  style={[
                    styles.statsText,
                    {
                      color: colors.text,
                      fontSize: fs(13),
                    },
                  ]}
                >
                  {t.presentCountLabel}: {stats.presentes}
                </Text>

                <Text
                  style={[
                    styles.statsText,
                    {
                      color: colors.textMuted,
                      fontSize: fs(13),
                    },
                  ]}
                >
                  {t.totalCountLabel}: {stats.total}
                </Text>
              </View>

              {visitants.length > 0 && (
                <View style={styles.visitantsSection}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: colors.accent,
                        fontSize: fs(14),
                      },
                    ]}
                  >
                    {t.visitantsLabel}
                  </Text>

                  {visitants.map((visitant) => (
                    <View key={visitant.id}>
                      {renderVisitant({
                        item: visitant,
                      })}
                    </View>
                  ))}
                </View>
              )}

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.accent,
                    fontSize: fs(14),
                  },
                ]}
              >
                {t.students}
              </Text>
            </>
          }
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons
                name="people-outline"
                size={54}
                color={colors.textMuted}
              />

              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.textMuted,
                    fontSize: fs(14),
                  },
                ]}
              >
                {t.noStudentsFound}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.bg,
            borderTopColor: colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveBatchBtn,
            {
              backgroundColor: colors.accent,
            },
          ]}
          onPress={saveBatch}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              color={colors.accentForeground}
            />
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={20}
                color={colors.accentForeground}
              />

              <Text
                style={[
                  styles.saveBatchText,
                  {
                    color: colors.accentForeground,
                    fontSize: fs(14),
                  },
                ]}
              >
                {t.saveListButton}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                    fontSize: fs(18),
                  },
                ]}
              >
                {t.newVisitantTitle}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setModalVisible(false)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.textMuted}
                />

                <TextInput
                  placeholder={t.namePlaceholder}
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={visitantName}
                  onChangeText={setVisitantName}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      fontSize: fs(14),
                    },
                  ]}
                />
              </View>

              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={colors.textMuted}
                />

                <TextInput
                  placeholder={t.phonePlaceholder}
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={visitantPhone}
                  onChangeText={setVisitantPhone}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      fontSize: fs(14),
                    },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.createBtn,
                  {
                    backgroundColor: colors.accent,
                  },
                ]}
                onPress={createVisitant}
              >
                <Ionicons
                  name="person-add-outline"
                  size={18}
                  color={colors.accentForeground}
                />

                <Text
                  style={[
                    styles.createBtnText,
                    {
                      color:
                        colors.accentForeground,
                      fontSize: fs(14),
                    },
                  ]}
                >
                  {t.createVisitantButton}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitleContainer: {
    alignItems: "center",
  },

  title: {
    fontWeight: "800",
  },

  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    gap: 6,
  },

  dateText: {
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: {
    padding: 18,
    paddingBottom: 120,
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statsText: {
    fontWeight: "700",
  },

  sectionTitle: {
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: 1,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderLeftWidth: 4,
  },

  cardInfo: {
    flex: 1,
  },

  studentName: {
    fontWeight: "700",
  },

  frequency: {
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
    justifyContent: "center",
    alignItems: "center",
  },

  visitantsSection: {
    marginBottom: 16,
  },

  visitantCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  visitantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  visitantBadge: {
    fontWeight: "900",
    letterSpacing: 1,
  },

  empty: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    marginTop: 12,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },

  saveBatchBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveBatchText: {
    fontWeight: "900",
    letterSpacing: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  modalTitle: {
    fontWeight: "800",
  },

  inputWrap: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    marginLeft: 12,
  },

  createBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  createBtnText: {
    fontWeight: "900",
    letterSpacing: 1,
  },
});