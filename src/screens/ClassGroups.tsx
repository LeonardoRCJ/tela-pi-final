import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  RefreshControl,
} from "react-native";
import { AppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { ClassGroup, SimpleClassGroup } from "../interfaces/classgroup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function ClassGroups() {
  const { getFontSize, getTextColor } = useContext(AppContext);

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [selectedClassGroup, setSelectedClassGroup] =
    useState<SimpleClassGroup | null>(null);
  const [classGroups, setClassGroups] = useState<SimpleClassGroup[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newClassGroupName, setNewClassGroupName] = useState<string>("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  // ESTADOS PARA EDIÇÃO
  const [editingId, setEditingId] = useState<number | null>(null);

  const getClassGroups = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/class-groups");

      setClassGroups(response.data);
    } catch (err: any) {
      console.log("Erro: ", err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getClassGroups();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await getClassGroups();
    } catch (err: any) {
      console.log("Erro, ", err.response.data.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fecharModal = () => {
    setModalVisible(false);
    setNewClassGroupName("");
    setEditingId(null); // Reseta o estado de edição
  };

  const prepararEdicao = (turma: SimpleClassGroup) => {
    setEditingId(turma.id!);
    setNewClassGroupName(turma.name);
    setModalVisible(true);
  };

  const saveClassGroup = async () => {
    if (!newClassGroupName.trim()) {
      Alert.alert("Erro", "Digite o nome da turma");
      return;
    }

    try {
      api.post(
        "/class-groups",
        {
          name: newClassGroupName,
        },
        {
          headers: {
            "Content-type": "application/json",
          },
        },
      );

      console.log("Turma criada com sucesso!");
      onRefresh();
    } catch (err: any) {
      console.log(err.response.data.message);
    }
    fecharModal();
  };

  const handleRemoveTurma = async (id: number) => {
    await api.delete(`/class-groups/${id}`);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Excluir Turma",
      `Tem certeza que deseja apagar a turma "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => handleRemoveTurma(id),
        },
      ],
    );
  };

  const renderClassGroup = ({ item }: { item: SimpleClassGroup }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardInfo}
        activeOpacity={0.7}
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate("DetalheTurma", {
              classGroupId: item.id,
              classGroupName: item.name,
            }),
          )
        }
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name="people"
            size={18}
            color="#D4AF37"
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.turmaNome, { fontSize: getFontSize(17) }]}>
            {item.name}
          </Text>
        </View>
        <Text
          style={[
            styles.turmaDetalhe,
            { fontSize: getFontSize(13), color: getTextColor("#666") },
          ]}
        >
          {item.countPractitioners} Alunos
        </Text>
      </TouchableOpacity>

      {/* BOTÃO EDITAR */}
      <TouchableOpacity
        style={styles.btnIcon}
        onPress={() => prepararEdicao(item)}
      >
        <Ionicons name="create-outline" size={22} color="#D4AF37" />
      </TouchableOpacity>

      {/* BOTÃO EXCLUIR */}
      <TouchableOpacity
        style={styles.btnIcon}
        onPress={() => {
          setSelectedClassGroup(item);
          setOpenDeleteDialog(true);
        }}
      >
        <Ionicons name="trash-outline" size={22} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const isDisabled = !newClassGroupName.trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: getFontSize(24) }]}>
            Minhas Turmas
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: getFontSize(12) }]}>
            Gerenciamento de Tatames
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="#0F0F0F" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={classGroups}
        keyExtractor={(item: SimpleClassGroup) => item.id!.toString()}
        renderItem={renderClassGroup}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={50} color="#444" />
            <Text style={[styles.emptyText, { fontSize: getFontSize(16) }]}>
              Nenhuma turma criada
            </Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(22) }]}>
              {editingId ? "Editar Turma" : "Nova Turma"}
            </Text>

            <Text style={[styles.label, { fontSize: getFontSize(12) }]}>
              Nome da Turma
            </Text>
            <TextInput
              style={[styles.input, { fontSize: getFontSize(16) }]}
              placeholder="Ex: JIU-JITSU NO-GI"
              placeholderTextColor="#555"
              value={newClassGroupName}
              onChangeText={setNewClassGroupName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={fecharModal}
              >
                <Text
                  style={[styles.cancelText, { fontSize: getFontSize(14) }]}
                >
                  CANCELAR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveClassGroup}
                style={[styles.btnSalvar, isDisabled && { opacity: 0.5 }]}
                disabled={isDisabled}
              >
                <Text
                  style={[styles.btnSalvarText, { fontSize: getFontSize(14) }]}
                >
                  {editingId ? "ATUALIZAR" : "CRIAR TURMA"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>

            <AlertDialogDescription>
              Deseja remover {selectedClassGroup?.name}? Essa ação não poderá
              ser desfeita em hipotese alguma.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancelar</Text>
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive"
              onPress={async () => {
                if (!selectedClassGroup?.id) return;

                await handleRemoveTurma(selectedClassGroup.id);
                setOpenDeleteDialog(false);
              }}
            >
              <Text className="color-white">Excluir</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerTitle: { color: "#FFF", fontWeight: "900" },
  headerSubtitle: { color: "#D4AF37", letterSpacing: 1 },
  btnAdd: {
    backgroundColor: "#D4AF37",
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#D4AF37",
  },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  turmaNome: { color: "#FFF", fontWeight: "bold" },
  turmaDetalhe: { color: "#666" },
  btnIcon: { padding: 8, marginLeft: 5 }, // Estilo unificado para ícones de ação
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#888", marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    width: "85%",
    padding: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: "#D4AF37",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { color: "#888", marginBottom: 5, marginLeft: 5 },
  input: {
    backgroundColor: "#252525",
    color: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalButtons: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  btnCancelar: { flex: 1, alignItems: "center" },
  cancelText: { color: "#888", fontWeight: "bold" },
  btnSalvar: {
    backgroundColor: "#D4AF37",
    flex: 1.5,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  btnSalvarText: { color: "#0F0F0F", fontWeight: "900" },
});
