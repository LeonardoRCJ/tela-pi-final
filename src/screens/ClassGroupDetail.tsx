import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

export interface TrainingSession {
  id?: number;
  date: string;
}

export default function DetalheTurma({ route, navigation }: any) {
  const { classGroupId, classGroupName } = route.params;
  const { colors, fs, t, language } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateLocale = language === "pt-BR" ? "pt-BR" : "en-US";

  async function loadSessions() {
    try {
      const { data } = await api.get(
        `/training-sessions/class-group/${classGroupId}`,
      );
      setSessions(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.toastError,
        text2: err?.response?.data?.message || t.loadSessionsError,
      });
    }
  }

  useEffect(() => {
    loadSessions();
  }, [classGroupId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, []);

  function closeModal() {
    setModalVisible(false);
    setSelectedDate(new Date());
    setShowDatePicker(false);
  }

  function openCreate() {
    setSelectedDate(new Date());
    setModalVisible(true);
  }

  async function createTrainingSession() {
    try {
      const isoDate = selectedDate.toISOString().split("T")[0];

      await api.post("/training-sessions", {
        date: isoDate,
        classGroupId: classGroupId,
      });

      Toast.show({
        type: "success",
        text1: t.sessionCreatedTitle,
        text2: t.sessionCreatedBody,
      });

      closeModal();
      loadSessions();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t.createSessionErrorTitle,
        text2: err?.response?.data?.message || t.createSessionErrorBody,
      });
    }
  }

  function deleteSession(id: number) {
    Alert.alert(t.deleteSessionTitle, t.deleteSessionMessage, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/training-sessions/${id}`);

            Toast.show({
              type: "success",
              text1: t.deleteSessionSuccessTitle,
              text2: t.deleteSessionSuccessBody,
            });

            loadSessions();
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: t.toastError,
              text2: err?.response?.data?.message || t.deleteSessionFail,
            });
          }
        },
      },
    ]);
  }

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

  const renderItem = ({ item }: { item: TrainingSession }) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.bgSecondary,
            borderColor: colors.cardBorder,
          },
        ]}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("TrainingSessionDetail", {
            sessionId: item.id,
            sessionDate: item.date,
            classGroupId,
            classGroupName,
          })
        }
        accessibilityLabel={`${t.trainingSession} ${formatDateToBR(item.date)}`}
        accessibilityRole="button"
      >
        <View style={[styles.cardIcon, { backgroundColor: colors.card }]}>
          <Ionicons name="calendar" size={24} color={colors.accent} />
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.sessionTitle, { color: colors.text, fontSize: fs(15) }]}>
            {t.trainingSession}
          </Text>
          <Text style={[styles.sessionDate, { color: colors.textMuted, fontSize: fs(13) }]}>
            {formatDateToBR(item.date)}
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSession(item.id!)} accessibilityLabel={t.deleteSession ?? "Excluir sessão"} accessibilityRole="button">
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textMuted}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.card }]}
        onPress={() => navigation.goBack()}
        accessibilityLabel={t.back ?? "Voltar"}
        accessibilityRole="button"
      >
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={[styles.title, { color: colors.text, fontSize: fs(17) }]}>
            {classGroupName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fs(12) }]}>
            {t.trainingHistory}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={openCreate}
          accessibilityLabel={t.newTrainingSession ?? "Nova sessão de treino"}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={colors.accentForeground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : `temp-${index}`
        }
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.albumsCta,
                {
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.cardBorder,
                },
              ]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate("MasterAlbums", {
                    classGroupId,
                    classGroupName,
                  }),
                )
              }
              accessibilityLabel={t.albumsSection}
              accessibilityRole="button"
            >
            <View style={[styles.albumsCtaIcon, { backgroundColor: colors.accent }]}>
              <Ionicons name="images" size={22} color={colors.accentForeground} />
            </View>
            <View style={styles.albumsCtaTextWrap}>
              <Text style={[styles.albumsCtaTitle, { color: colors.text, fontSize: fs(16) }]}>
                {t.albumsSection}
              </Text>
              <Text
                style={[styles.albumsCtaSubtitle, { color: colors.textMuted, fontSize: fs(13) }]}
              >
                {t.albumsSectionHint}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={54} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text, fontSize: fs(16) }]}>
              {t.noSessionsTitle}
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textMuted, fontSize: fs(13) }]}>
              {t.noSessionsHint}
            </Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: fs(19) }]}>
              {t.newTrainingSession}
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textMuted, fontSize: fs(13) }]}>
              {t.trainingDateLabel}
            </Text>
            <TouchableOpacity
              style={[
                styles.dateSelector,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
              accessibilityLabel={t.trainingDateLabel ?? "Selecionar data"}
              accessibilityRole="button"
            >
              <Ionicons name="calendar" size={20} color={colors.accent} />
              <Text style={[styles.dateSelectorText, { color: colors.text, fontSize: fs(16) }]}>
                {selectedDate.toLocaleDateString(dateLocale)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <View style={styles.modalRow}>
              <Pressable
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
                ]}
                onPress={closeModal}
                accessibilityLabel={t.cancel}
                accessibilityRole="button"
              >
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>{t.cancel}</Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={createTrainingSession}
                accessibilityLabel={t.create ?? "Criar sessão"}
                accessibilityRole="button"
              >
                <Text style={[styles.saveText, { color: colors.accentForeground }]}>{t.create}</Text>
              </Pressable>
            </View>
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
  title: {
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 2,
  },
  listContainer: {
    padding: 18,
    paddingBottom: 30,
    flexGrow: 1,
  },
  albumsCta: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  albumsCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  albumsCtaTextWrap: {
    flex: 1,
  },
  albumsCtaTitle: {
    fontWeight: "800",
  },
  albumsCtaSubtitle: {
    marginTop: 4,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontWeight: "700",
  },
  sessionDate: {
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 90,
  },
  emptyText: {
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubText: {
    marginTop: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.78)",
    justifyContent: "center",
    padding: 22,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  dateSelectorText: {
    marginLeft: 12,
    fontWeight: "600",
  },
  modalRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  saveBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "700",
  },
  saveText: {
    fontWeight: "900",
  },
});
