import React, { useState, useEffect, useContext } from 'react'; 
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

// Importar o Contexto
import { AppContext } from '../context/AppContext'; 

export default function DetalheTurma({ route, navigation }) {
  const { getFontSize, getTextColor } = useContext(AppContext);

  const turmaNome = route?.params?.nome || 'Minha Turma';
  const STORAGE_KEY = `@alunos_${turmaNome}`;

  const [dataAtual, setDataAtual] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR');

  const [alunos, setAlunos] = useState([]);
  const [carregou, setCarregou] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaFaixa, setNovaFaixa] = useState('Branca');
  
  // ESTADO PARA EDIÇÃO
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
        if (dadosSalvos) setAlunos(JSON.parse(dadosSalvos));
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os alunos.");
      } finally {
        setCarregou(true);
      }
    };
    carregarDados();
  }, []);

  useEffect(() => {
    if (carregou) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
    }
  }, [alunos, carregou]);

  const mudarDia = (dias) => {
    const novaData = new Date(dataAtual);
    novaData.setDate(novaData.getDate() + dias);
    setDataAtual(novaData);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDataAtual(selectedDate);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setNovoNome('');
    setNovaFaixa('Branca');
    setEditandoId(null);
  };

  const prepararEdicao = (aluno) => {
    setEditandoId(aluno.id);
    setNovoNome(aluno.nome);
    setNovaFaixa(aluno.faixa);
    setModalVisivel(true);
  };

  const salvarAluno = () => {
    if (!novoNome.trim()) return Alert.alert("Erro", "Digite o nome");

    if (editandoId) {
      // Editar existente
      setAlunos(prev => prev.map(a => 
        a.id === editandoId ? { ...a, nome: novoNome, faixa: novaFaixa } : a
      ));
    } else {
      // Criar novo
      const novoAluno = {
        id: Date.now().toString(),
        nome: novoNome,
        faixa: novaFaixa,
        historico: [],
      };
      setAlunos(prev => [...prev, novoAluno]);
    }
    fecharModal();
  };

  const marcarStatus = (alunoId, statusDesejado) => {
    setAlunos(prev => prev.map(aluno => {
      if (aluno.id === alunoId) {
        const historico = aluno.historico || [];
        const registroHoje = historico.find(h => h.data === dataFormatada);
        
        let novoHistorico;
        if (registroHoje && registroHoje.presente === statusDesejado) {
          novoHistorico = historico.filter(h => h.data !== dataFormatada);
        } else {
          const outroRegistros = historico.filter(h => h.data !== dataFormatada);
          novoHistorico = [...outroRegistros, { 
            id: Date.now().toString(), 
            data: dataFormatada, 
            presente: statusDesejado 
          }];
        }
        return { ...aluno, historico: novoHistorico };
      }
      return aluno;
    }));
  };

  const calcularFrequencia = (historico) => {
    if (!historico || historico.length === 0) return "0%";
    const presencas = historico.filter(h => h.presente === true).length;
    const totalAulas = historico.length;
    const porcentagem = Math.round((presencas / totalAulas) * 100);
    return `${porcentagem}%`;
  };

  const renderAluno = ({ item }) => {
    const registroHoje = item.historico?.find(h => h.data === dataFormatada);
    const isPresente = registroHoje?.presente === true;
    const isFaltante = registroHoje?.presente === false;

    return (
      <View style={[
        styles.card, 
        isPresente && styles.cardPresente,
        isFaltante && styles.cardFalta
      ]}>
        <View style={styles.info}>
          <Text style={[styles.nomeText, { fontSize: getFontSize(16) }]}>{item.nome}</Text>
          <Text style={[styles.faixaText, { fontSize: getFontSize(12), color: getTextColor('#888') }]}>
            {item.faixa} • 
            <Text style={{color: '#D4AF37'}}> {calcularFrequencia(item.historico)}</Text>
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.btnAction} onPress={() => prepararEdicao(item)}>
            <Ionicons name="create-outline" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnAction}
            onPress={() => navigation.navigate('FrequenciaAluno', { 
              alunoNome: item.nome, 
              historico: item.historico || []
            })}
          >
            <Ionicons name="stats-chart" size={20} color="#D4AF37" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnStatus, isFaltante && styles.btnFaltaAtivo]}
            onPress={() => marcarStatus(item.id, false)}
          >
            <Ionicons 
              name={isFaltante ? "close-circle" : "close-circle-outline"} 
              size={26} 
              color={isFaltante ? "#FFF" : "#444"} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnStatus, isPresente && styles.btnCheckAtivo]}
            onPress={() => marcarStatus(item.id, true)}
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
              Alert.alert("Remover", `Remover ${item.nome}?`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: () => setAlunos(prev => prev.filter(a => a.id !== item.id)) }
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
            <Text style={[styles.title, { fontSize: getFontSize(16) }]}>{turmaNome}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.subtitle, { fontSize: getFontSize(12) }]}>{dataFormatada}</Text>
                <Ionicons name="calendar-outline" size={12} color="#D4AF37" style={{ marginLeft: 5 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => mudarDia(1)} style={styles.btnDateNav}>
            <Ionicons name="caret-forward" size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisivel(true)}>
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
        data={alunos}
        renderItem={renderAluno}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontSize: getFontSize(20) }]}>
              {editandoId ? 'Editar Atleta' : 'Novo Aluno'}
            </Text>
            
            <TextInput 
              style={[styles.input, { fontSize: getFontSize(16) }]} 
              placeholder="Nome do Atleta" 
              placeholderTextColor="#555" 
              value={novoNome} 
              onChangeText={setNovoNome} 
            />
            
            <Text style={[styles.label, { fontSize: getFontSize(12) }]}>Faixa</Text>
            <View style={styles.faixaRow}>
              {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map((f) => (
                <TouchableOpacity 
                  key={f} 
                  style={[styles.faixaBadge, novaFaixa === f && styles.faixaBadgeAtiva]} 
                  onPress={() => setNovaFaixa(f)}
                >
                  <Text style={[
                    styles.faixaBadgeText, 
                    { fontSize: getFontSize(11) },
                    novaFaixa === f && styles.faixaBadgeTextAtivo
                  ]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.btnVoltar} onPress={fecharModal}>
                <Text style={[styles.btnVoltarText, { fontSize: getFontSize(14) }]}>VOLTAR</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnConfirmar} onPress={salvarAluno}>
                <Text style={[styles.btnConfirmarText, { fontSize: getFontSize(14) }]}>
                  {editandoId ? 'SALVAR' : 'CONFIRMAR'}
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
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 15, paddingTop: 50, 
    borderBottomWidth: 1, borderBottomColor: '#1A1A1A' 
  },
  dateController: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnDateNav: { padding: 10 },
  title: { color: '#FFF', fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#D4AF37', marginTop: 2, textAlign: 'center' },
  btnAdd: { backgroundColor: '#D4AF37', width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#1A1A1A', flexDirection: 'row', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' },
  cardPresente: { borderLeftWidth: 4, borderLeftColor: '#2ECC71', backgroundColor: '#1e1e1e' },
  cardFalta: { borderLeftWidth: 4, borderLeftColor: '#E74C3C', backgroundColor: '#1e1e1e' },
  info: { flex: 1 },
  nomeText: { color: '#FFF', fontWeight: 'bold' },
  faixaText: { color: '#888' },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  btnAction: { padding: 8 },
  btnStatus: { padding: 4, borderRadius: 20, marginHorizontal: 2 },
  btnCheckAtivo: { backgroundColor: '#2ECC71' },
  btnFaltaAtivo: { backgroundColor: '#E74C3C' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40 },
  modalTitle: { color: '#D4AF37', fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#252525', color: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20 },
  faixaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 30 },
  faixaBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  faixaBadgeAtiva: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  faixaBadgeText: { color: '#888', fontWeight: 'bold' },
  faixaBadgeTextAtivo: { color: '#0F0F0F' },
  modalButtonsRow: { flexDirection: 'row', gap: 10 },
  btnVoltar: { flex: 1, padding: 18, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  btnVoltarText: { color: '#888', fontWeight: 'bold' },
  btnConfirmar: { flex: 2, backgroundColor: '#D4AF37', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnConfirmarText: { color: '#0F0F0F', fontWeight: 'bold' }
});