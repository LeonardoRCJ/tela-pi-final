import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ALUNOS = [
  { id: '1', nome: 'Renato Silva', faixa: 'Azul', graus: 2 },
  { id: '2', nome: 'Marta Souza', faixa: 'Marrom', graus: 1 },
  { id: '3', nome: 'Lucas Lima', faixa: 'Branca', graus: 4 },
];

export default function Chamada() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.nomeText}>{item.nome}</Text>
        <View style={styles.tagFaixa}>
           <Text style={styles.faixaText}>Faixa {item.faixa} • {item.graus}º Grau</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.btnCheck} activeOpacity={0.7}>
        <Ionicons name="checkmark-sharp" size={24} color="#0F0F0F" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Presença</Text>
        <Text style={styles.date}>Sexta-feira, 27 de Março</Text>
      </View>
      <FlatList
        data={ALUNOS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { padding: 20, paddingTop: 40 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  date: { color: '#D4AF37', fontSize: 14, fontWeight: '500', marginTop: 5 },
  card: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37'
  },
  info: { flex: 1 },
  nomeText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  tagFaixa: { marginTop: 4 },
  faixaText: { color: '#AAA', fontSize: 13 },
  btnCheck: {
    backgroundColor: '#D4AF37',
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  }
});