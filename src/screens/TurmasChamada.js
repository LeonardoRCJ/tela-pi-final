import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Alert, Modal, KeyboardAvoidingView, Platform, TextInput
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TurmasChamada({ navigation }) {
  const { getFontSize, getTextColor } = useContext(AppContext);

  const [turmas, setTurmas] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novaTurmaNome, setNovaTurmaNome] = useState('');
  
  // ESTADOS PARA EDIÇÃO
  const [editandoId, setEditandoId] = useState(null);

  const [horario, setHorario] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [horarioDefinido, setHorarioDefinido] = useState(false);

  const formatarHorario = (date) => {
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  const onChangeHorario = (event, selectedDate) => {
    if (Platform.OS === 'android') setMostrarPicker(false);
    if (event.type === 'set') {
      const currentDate = selectedDate || horario;
      setHorario(currentDate);
      setHorarioDefinido(true);
    } 
  };

  const abrirPicker = () => setMostrarPicker(true);

  const fecharModal = () => {
    setModalVisivel(false);
    setNovaTurmaNome('');
    setHorario(new Date());
    setHorarioDefinido(false);
    setMostrarPicker(false);
    setEditandoId(null); // Reseta o estado de edição
  };

  // FUNÇÃO PARA CARREGAR DADOS NA EDIÇÃO
  const prepararEdicao = (turma) => {
    setEditandoId(turma.id);
    setNovaTurmaNome(turma.nome);
    
    // Tenta converter a string de horário de volta para Date para o Picker
    if (turma.horario !== 'Horário Livre') {
        const [horas, minutos] = turma.horario.split(':');
        const d = new Date();
        d.setHours(parseInt(horas), parseInt(minutos));
        setHorario(d);
        setHorarioDefinido(true);
    }

    setModalVisivel(true);
  };

  const salvarTurma = () => {
    if (!novaTurmaNome.trim()) {
      Alert.alert("Erro", "Digite o nome da turma");
      return;
    }

    const horarioTexto = horarioDefinido ? formatarHorario(horario) : 'Horário Livre';

    if (editandoId) {
      // Lógica de Atualização
      setTurmas(prev => prev.map(t => 
        t.id === editandoId 
        ? { ...t, nome: novaTurmaNome.toUpperCase(), horario: horarioTexto } 
        : t
      ));
    } else {
      // Lógica de Criação
      const nova = {
        id: Date.now().toString(),
        nome: novaTurmaNome.toUpperCase(),
        horario: horarioTexto,
        alunos: 0
      };
      setTurmas(prev => [...prev, nova]);
    }

    fecharModal();
  };

  const confirmarExclusao = (id, nome) => {
    Alert.alert(
      "Excluir Turma",
      `Tem certeza que deseja apagar a turma "${nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => setTurmas(prev => prev.filter(t => t.id !== id)) }
      ]
    );
  };

  const renderTurma = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardInfo} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('DetalheTurma', { nome: item.nome })}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="people" size={18} color="#D4AF37" style={{marginRight: 8}} />
          <Text style={[styles.turmaNome, { fontSize: getFontSize(17) }]}>
            {item.nome}
          </Text>
        </View>
        <Text style={[styles.turmaDetalhe, { fontSize: getFontSize(13), color: getTextColor('#666') }]}>
          {item.horario} • {item.alunos} Alunos
        </Text>
      </TouchableOpacity>
      
      {/* BOTÃO EDITAR */}
      <TouchableOpacity style={styles.btnIcon} onPress={() => prepararEdicao(item)}>
        <Ionicons name="create-outline" size={22} color="#D4AF37" />
      </TouchableOpacity>

      {/* BOTÃO EXCLUIR */}
      <TouchableOpacity style={styles.btnIcon} onPress={() => confirmarExclusao(item.id, item.nome)}>
        <Ionicons name="trash-outline" size={22} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const isDisabled = !novaTurmaNome.trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: getFontSize(24) }]}>Minhas Turmas</Text>
          <Text style={[styles.headerSubtitle, { fontSize: getFontSize(12) }]}>Gerenciamento de Tatame</Text>
        </View>

        <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisivel(true)}>
          <Ionicons name="add" size={30} color="#0F0F0F" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={turmas}
        keyExtractor={item => item.id}
        renderItem={renderTurma}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={50} color="#444" />
            <Text style={[styles.emptyText, { fontSize: getFontSize(16) }]}>Nenhuma turma criada</Text>
          </View>
        )}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(22) }]}>
                {editandoId ? 'Editar Turma' : 'Nova Turma'}
            </Text>
            
            <Text style={[styles.label, { fontSize: getFontSize(12) }]}>Nome da Turma</Text>
            <TextInput 
              style={[styles.input, { fontSize: getFontSize(16) }]} 
              placeholder="Ex: JIU-JITSU NO-GI" 
              placeholderTextColor="#555"
              value={novaTurmaNome}
              onChangeText={setNovaTurmaNome}
            />

            <Text style={[styles.label, { fontSize: getFontSize(12) }]}>Horário de Aula</Text>
            <TouchableOpacity 
              style={[styles.input, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}
              onPress={abrirPicker}
            >
              <Text style={{ color: horarioDefinido ? '#FFF' : '#666', fontSize: getFontSize(16) }}>
                {horarioDefinido ? formatarHorario(horario) : 'Selecionar horário'}
              </Text>
              <Ionicons name="time-outline" size={20} color="#D4AF37" />
            </TouchableOpacity>

            {mostrarPicker && (
              <DateTimePicker
                value={horario}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={onChangeHorario}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancelar} onPress={fecharModal}>
                <Text style={[styles.cancelText, { fontSize: getFontSize(14) }]}>CANCELAR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={salvarTurma} 
                style={[styles.btnSalvar, isDisabled && {opacity: 0.5}]}
                disabled={isDisabled}
              >
                <Text style={[styles.btnSalvarText, { fontSize: getFontSize(14) }]}>
                    {editandoId ? 'ATUALIZAR' : 'CRIAR TURMA'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 25, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' 
  },
  headerTitle: { color: '#FFF', fontWeight: '900' },
  headerSubtitle: { color: '#D4AF37', letterSpacing: 1 },
  btnAdd: { backgroundColor: '#D4AF37', width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#D4AF37' },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  turmaNome: { color: '#FFF', fontWeight: 'bold' },
  turmaDetalhe: { color: '#666' },
  btnIcon: { padding: 8, marginLeft: 5 }, // Estilo unificado para ícones de ação
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1A1A1A', width: '85%', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#D4AF37', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { color: '#888', marginBottom: 5, marginLeft: 5 },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  btnCancelar: { flex: 1, alignItems: 'center' },
  cancelText: { color: '#888', fontWeight: 'bold' },
  btnSalvar: { backgroundColor: '#D4AF37', flex: 1.5, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  btnSalvarText: { color: '#0F0F0F', fontWeight: '900' }
});