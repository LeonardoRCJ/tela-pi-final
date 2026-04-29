import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import  DateTimePicker, { DateTimePickerEvent }  from '@react-native-community/datetimepicker'

// Importar o Contexto
import { AppContext } from "../context/AppContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import api from "../services/api";
import { Attendances, Practitioner } from "../interfaces/practitioner";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Main: {
    screen?: string;
  };
  DetalheTurma: undefined;
  FrequenciaAluno: undefined;
};

type NavigationProps =
  NativeStackNavigationProp<
    RootStackParamList
  >;

export default function DetalheTurma({ route, navigation }: any) {
  const { getFontSize, getTextColor } = useContext(AppContext);

  const { classGroupId, classGroupName } = route.params;

  const [dataAtual, setDataAtual] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [dataFormatada, setDataFormatada] = useState(dataAtual.toLocaleDateString('pt-BR'));

  // ESTADO PARA EDIÇÃO
  const [editingId, setEditingId] = useState<number | undefined | null>(null);


  const getPractitioners = async () => {
    try {
      const response = await api.get(`/class-groups/${classGroupId}/practitioners`);

      setPractitioners(response.data);
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível carregar os alunos.");
    }
  };

  useEffect(() => {
    getPractitioners();
  }, [classGroupId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getPractitioners();
    }catch(err: any) {
      console.log("Erro: ", err.response.data.message);
    } finally {
      setRefreshing(false);
    }
  },[])

  const mudarDia = (dias: number) => {
    const novaData = new Date(dataAtual);
    novaData.setDate(novaData.getDate() + dias);
    setDataAtual(novaData);
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewName("");
    setNewPhone("");
    setEditingId(null);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) setDataAtual(selectedDate);
  };

  const setupEdit = (practitioner: Practitioner) => {
    setEditingId(practitioner.id);
    setNewName(practitioner.name);
    setNewPhone(practitioner.phone);
    setModalVisible(true);
  };

  const savePractitioner = async () => {
    try {
      await api.post(`/class-groups/${classGroupId}/practitioners`, {
        name: newName,
        phone: newPhone,
        classGroupId: classGroupId,
      });

      onRefresh();
    } catch (err: any) {
      console.log(err.response.data.message);
    }

    closeModal();
  };

  const marcarStatus = (practitionerId: number, statusDesejado: any) => {
    setPractitioners((prev) =>
      prev.map((aluno: Practitioner) => {
        if (aluno.id === practitionerId) {
          const historico = aluno.attendances || [];
          const registroHoje = historico.find((h: any) => h.data === dataFormatada);

          let novoHistorico;
          if (registroHoje && registroHoje.present === statusDesejado) {
            novoHistorico = historico.filter((h: any) => h.data !== dataFormatada);
          } else {
            const outroRegistros = historico.filter(
              (h: any) => h.data !== dataFormatada,
            );
            novoHistorico = [
              ...outroRegistros,
              {
                id: Date.now().toString(),
                data: dataFormatada,
                presente: statusDesejado,
              },
            ];
          }
          return { ...aluno, historico: novoHistorico };
        }
        return aluno;
      }),
    );
  };

  const calcularFrequencia = (historico: Attendances[]) => {
    if ( historico.length === 0) return "0%";
    const presencas = historico.filter((h) => h.present === true).length;
    const totalAulas = historico.length;
    const porcentagem = Math.round((presencas / totalAulas) * 100);
    return `${porcentagem}%`;
  };

  const renderPractitioner = ({ item }: {item: Practitioner}) => {
    const registroHoje = item.attendances?.find(h => h.date === dataFormatada);
    const isPresente = registroHoje?.present === true;
    const isFaltante = registroHoje?.present === false;

    return (
      <View style={[
        styles.card, 
        isPresente && styles.cardPresente,
        isFaltante && styles.cardFalta
      ]}>
        <View style={styles.info}>
          <Text style={[styles.nomeText, { fontSize: getFontSize(16) }]}>{item.name}</Text>
            <Text style={{color: '#D4AF37'}}> {calcularFrequencia(item.attendances)}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.btnAction} onPress={() => setupEdit(item)}>
            <Ionicons name="create-outline" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnAction}
            onPress={() => navigation.navigate('FrequenciaAluno', { 
              alunoNome: item.name, 
              historico: item.attendances || []
            })}
          >
            <Ionicons name="stats-chart" size={20} color="#D4AF37" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnStatus, isFaltante && styles.btnFaltaAtivo]}
            onPress={() => marcarStatus(item.id!, false)}
          >
            <Ionicons 
              name={isFaltante ? "close-circle" : "close-circle-outline"} 
              size={26} 
              color={isFaltante ? "#FFF" : "#444"} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnStatus, isPresente && styles.btnCheckAtivo]}
            onPress={() => marcarStatus(item.id!, true)}
          >
            <Ionicons 
              name={isPresente ? "checkmark-circle" : "add-circle-outline"} 
              size={26} 
              color={isPresente ? "#0F0F0F" : "#444"} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnAction}
            onPress={() => {
              Alert.alert("Remover", `Remover ${item.name}?`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: () => setPractitioners(prev => prev.filter(a => a.id !== item.id)) }
              ])
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#D4AF37" />
        </TouchableOpacity>
        
        <View style={styles.dateController}>
          <TouchableOpacity onPress={() => mudarDia(-1)} style={styles.btnDateNav}>
            <Ionicons name="caret-back" size={20} color="#D4AF37" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ alignItems: 'center', minWidth: 150 }}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.title, { fontSize: getFontSize(16) }]}>{classGroupName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.subtitle, { fontSize: getFontSize(12) }]}>{dataFormatada}</Text>
                <Ionicons name="calendar-outline" size={12} color="#D4AF37" style={{ marginLeft: 5 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => mudarDia(1)} style={styles.btnDateNav}>
            <Ionicons name="caret-forward" size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add" size={22} color="#0F0F0F" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dataAtual}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChangeDate}
        />
      )}

      <FlatList
        data={practitioners}
        renderItem={renderPractitioner}
        keyExtractor={item => item.id?.toString()!}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
        }
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(20) }]}>
              {editingId ? 'Editar Atleta' : 'Novo Aluno'}
            </Text>
            
            <TextInput 
              style={[styles.input, { fontSize: getFontSize(16) }]} 
              placeholder="Nome do Atleta" 
              placeholderTextColor="#555" 
              value={newName} 
              onChangeText={setNewName} 
            />

            <TextInput 
              style={[styles.input, { fontSize: getFontSize(16) }]} 
              placeholder="Telefone do Atleta" 
              placeholderTextColor="#555" 
              value={newPhone} 
              onChangeText={setNewPhone} 
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.btnVoltar} onPress={closeModal}>
                <Text style={[styles.btnVoltarText, { fontSize: getFontSize(14) }]}>VOLTAR</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnConfirmar} onPress={savePractitioner}>
                <Text style={[styles.btnConfirmarText, { fontSize: getFontSize(14) }]}>
                  {editingId ? 'SALVAR' : 'CONFIRMAR'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  dateController: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDateNav: { padding: 10 },
  title: { color: "#FFF", fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#D4AF37", marginTop: 2, textAlign: "center" },
  btnAdd: {
    backgroundColor: "#D4AF37",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardPresente: {
    borderLeftWidth: 4,
    borderLeftColor: "#2ECC71",
    backgroundColor: "#1e1e1e",
  },
  cardFalta: {
    borderLeftWidth: 4,
    borderLeftColor: "#E74C3C",
    backgroundColor: "#1e1e1e",
  },
  info: { flex: 1 },
  nomeText: { color: "#FFF", fontWeight: "bold" },
  faixaText: { color: "#888" },
  actionButtons: { flexDirection: "row", alignItems: "center" },
  btnAction: { padding: 8 },
  btnStatus: { padding: 4, borderRadius: 20, marginHorizontal: 2 },
  btnCheckAtivo: { backgroundColor: "#2ECC71" },
  btnFaltaAtivo: { backgroundColor: "#E74C3C" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: { color: "#D4AF37", fontWeight: "bold", marginBottom: 20 },
  label: { color: "#888", marginBottom: 8, textTransform: "uppercase" },
  input: {
    backgroundColor: "#252525",
    color: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  faixaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 30,
  },
  faixaBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  faixaBadgeAtiva: { backgroundColor: "#D4AF37", borderColor: "#D4AF37" },
  faixaBadgeText: { color: "#888", fontWeight: "bold" },
  faixaBadgeTextAtivo: { color: "#0F0F0F" },
  modalButtonsRow: { flexDirection: "row", gap: 10 },
  btnVoltar: {
    flex: 1,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  btnVoltarText: { color: "#888", fontWeight: "bold" },
  btnConfirmar: {
    flex: 2,
    backgroundColor: "#D4AF37",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  btnConfirmarText: { color: "#0F0F0F", fontWeight: "bold" },
});
