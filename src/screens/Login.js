import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const isValid = email && senha;

  function handleLogin() {
    navigation.replace('Main');
  }

  return (
    <View style={styles.container}>

      <Ionicons name="calendar" size={60} color="#D4AF37" />

      <Text style={styles.title}>Bem-vindo</Text>
      <Text style={styles.subtitle}>Entre na sua conta</Text>

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

      <TouchableOpacity
        style={[styles.button, !isValid && styles.buttonDisabled]}
        disabled={!isValid}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>
          Não tem conta? <Text style={styles.linkBold}>Criar agora</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 15,
  },

  subtitle: {
    color: '#AAA',
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
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
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