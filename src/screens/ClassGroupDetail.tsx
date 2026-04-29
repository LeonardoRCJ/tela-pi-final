import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../services/api";
import { Attendances, Practitioner } from "../interfaces/practitioner";

export default function DetalheTurma({ route, navigation }: any) {
  const { classGroupId, classGroupName } = route.params;

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Practitioner[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const formattedDate = useMemo(
    () => date.toLocaleDateString("pt-BR"),
    [date],
  );

  async function loadStudents() {
    try {
      const { data } = await api.get(
        `/class-groups/${classGroupId}/practitioners`,
      );
      setStudents(data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: err?.response?.data?.message || "Falha ao carregar alunos",
      });
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  }, []);

  function changeDay(value: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + value);
    setDate(next);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingId(null);
    setName("");
    setPhone("");
  }

  function openCreate() {
    closeModal();
    setModalVisible(true);
  }

  function openEdit(student: Practitioner) {
    setEditingId(student.id!);
    setName(student.name);
    setPhone(student.phone);
    setModalVisible(true);
  }

  async function saveStudent() {
    try {
      await api.post(`/class-groups/${classGroupId}/practitioners`, {
        name,
        phone,
        classGroupId,
      });

      Toast.show({
        type: "success",
        text1: "Aluno cadastrado",
      });

      closeModal();
      loadStudents();
    } catch {
      Toast.show({
        type: "error",
        text1: "Erro ao cadastrar",
      });
    }
  }

  function getFrequency(att: Attendances[]) {
    if (!att || att.length === 0) return "0%";

    const total = att.length;
    const present = att.filter((x) => x.present).length;

    return `${Math.round((present / total) * 100)}%`;
  }

  function markAttendance(id: number, present: boolean) {
    setStudents((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const current = item.attendances || [];
        const today = current.find((a) => a.date === formattedDate);

        let updated;

        if (today && today.present === present) {
          updated = current.filter((a) => a.date !== formattedDate);
        } else {
          updated = [
            ...current.filter((a) => a.date !== formattedDate),
            {
              id: Date.now(),
              date: formattedDate,
              present,
            },
          ];
        }

        return { ...item, attendances: updated };
      }),
    );
  }

  const renderItem = ({ item }: { item: Practitioner }) => {
    const today = item.attendances?.find(
      (x) => x.date === formattedDate,
    );

    const isPresent = today?.present === true;
    const isAbsent = today?.present === false;

    return (
      <View
        style={[
          styles.card,
          isPresent && styles.cardPresent,
          isAbsent && styles.cardAbsent,
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{item.practitionerName}</Text>
          <Text style={styles.frequency}>
            Frequência {getFrequency(item.attendances)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => openEdit(item)}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color="#D4AF37"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBtn,
              isAbsent && { backgroundColor: "#FF4444" },
            ]}
            onPress={() => markAttendance(item.id!, false)}
          >
            <Ionicons
              name={
                isAbsent
                  ? "close-circle"
                  : "close-circle-outline"
              }
              size={24}
              color={isAbsent ? "#FFF" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBtn,
              isPresent && { backgroundColor: "#2ECC71" },
            ]}
            onPress={() => markAttendance(item.id!, true)}
          >
            <Ionicons
              name={
                isPresent
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={24}
              color={isPresent ? "#0F0F0F" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              navigation.navigate("FrequenciaAluno", {
                alunoNome: item.name,
                historico: item.attendances || [],
              })
            }
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color="#AAA"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#D4AF37"
          />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>{classGroupName}</Text>

          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#D4AF37"
            />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={openCreate}
        >
          <Ionicons
            name="person-add"
            size={20}
            color="#0F0F0F"
          />
        </TouchableOpacity>
      </View>

      {/* DATE NAV */}
      <View style={styles.dateNav}>
        <TouchableOpacity
          style={styles.dayBtn}
          onPress={() => changeDay(-1)}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color="#D4AF37"
          />
        </TouchableOpacity>

        <Text style={styles.dayText}>Selecionar Dia</Text>

        <TouchableOpacity
          style={styles.dayBtn}
          onPress={() => changeDay(1)}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#D4AF37"
          />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={
            Platform.OS === "ios" ? "inline" : "default"
          }
          onChange={(
            event: DateTimePickerEvent,
            selectedDate?: Date,
          ) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* LIST */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 30,
          flexGrow: 1,
        }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={54}
              color="#333"
            />
            <Text style={styles.emptyText}>
              Nenhum aluno cadastrado
            </Text>
          </View>
        )}
      />

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={
            Platform.OS === "ios" ? "padding" : undefined
          }
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingId
                ? "Editar aluno"
                : "Novo aluno"}
            </Text>

            <TextInput
              placeholder="Nome"
              placeholderTextColor="#666"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Telefone"
              placeholderTextColor="#666"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />

            <View style={styles.modalRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={closeModal}
              >
                <Text style={styles.cancelText}>
                  CANCELAR
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveBtn}
                onPress={saveStudent}
              >
                <Text style={styles.saveText}>
                  {editingId
                    ? "SALVAR"
                    : "CADASTRAR"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },

  dateBox: {
    marginTop: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  dateText: {
    color: "#AAA",
    fontSize: 12,
  },

  dateNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 16,
  },

  dayBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
  },

  dayText: {
    color: "#888",
    fontSize: 13,
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

  studentName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  frequency: {
    color: "#D4AF37",
    fontSize: 12,
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  iconBtn: {
    padding: 6,
  },

  statusBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1D1D1D",
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 90,
  },

  emptyText: {
    color: "#666",
    marginTop: 10,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.78)",
    justifyContent: "center",
    padding: 22,
  },

  modal: {
    backgroundColor: "#141414",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#222",
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 18,
  },

  input: {
    backgroundColor: "#1D1D1D",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: "#FFF",
    marginBottom: 12,
  },

  modalRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 15,
    backgroundColor: "#1D1D1D",
    alignItems: "center",
  },

  saveBtn: {
    flex: 1.4,
    borderRadius: 14,
    paddingVertical: 15,
    backgroundColor: "#D4AF37",
    alignItems: "center",
  },

  cancelText: {
    color: "#AAA",
    fontWeight: "700",
  },

  saveText: {
    color: "#0A0A0A",
    fontWeight: "900",
  },
});