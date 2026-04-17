import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch('http://10.135.156.24/api/auth/sign-up', 
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            name: nome,
            email: email,
            password: senha
          })
        }
      )
    }catch(err) {
        console.log(err.message());
    }

    
  };

  return (
    <View style={styles.container}>

      {/* ÍCONE */}
      <Ionicons name="person-add" size={60} color="#D4AF37" />

      {/* TÍTULO */}
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Entre para o mundo noturno</Text>

      {/* NOME */}
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#AAA" />
        <TextInput
          placeholder="Nome"
          placeholderTextColor="#777"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
      </View>

      {/* EMAIL */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#AAA" />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* SENHA */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#AAA" />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#777"
          secureTextEntry
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      {/* CONFIRMAR SENHA */}
      <View style={styles.inputContainer}>
        <Ionicons name="shield-checkmark" size={20} color="#AAA" />
        <TextInput
          placeholder="Confirmar senha"
          placeholderTextColor="#777"
          secureTextEntry
          style={styles.input}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
      </View>

      {/* BOTÃO */}
      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      {/* VOLTAR */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>
          Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    padding: 25,
  },

  title: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 15,
  },

  subtitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 30,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 12,
    marginLeft: 10,
  },

  button: {
    backgroundColor: '#D4AF37',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  link: {
    color: '#AAA',
    textAlign: 'center',
    marginTop: 20,
  },

  linkBold: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
});