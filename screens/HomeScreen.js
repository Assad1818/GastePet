import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import TextInputBox from '../components/TextInputBox/TextInputBox';
import CustomButton from '../components/CustomButton/CustomButton';
import { createUser, getUserByCredentials, clearDatabase } from '../repository/db';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { user, setUser } = useContext(AuthContext);

  const [isRegistering, setIsRegistering] = useState(false);

  // Campos de login
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  // Campos de cadastro
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  // --- LOGIN ---
  const handleLogin = async () => {
    if (!usuario || !senha) return Alert.alert('Erro','Preencha usuário e senha.');

    try {
      const u = await getUserByCredentials(usuario, senha);
      if (u) {
        setUser(u);
        await AsyncStorage.setItem('loggedUser', JSON.stringify(u));
        Alert.alert('Sucesso', `Bem-vindo ${u.usuario}`);
        setUsuario(''); setSenha('');
        setIsRegistering(false);
      } else {
        Alert.alert('Erro','Usuário ou senha inválidos.');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Erro','Erro ao logar');
    }
  };

  // --- CADASTRO ---
  const handleRegister = async () => {
    if (!nomeCompleto || !email || !usuario || !senha || !confirmaSenha)
      return Alert.alert('Erro','Preencha todos os campos.');
    if (senha !== confirmaSenha)
      return Alert.alert('Erro','Senha e confirmação diferentes.');

    const dataCadastro = new Date().toISOString(); // armazena data atual

    try {
      await createUser(email, usuario, senha, nomeCompleto, dataCadastro);
      Alert.alert('Sucesso','Usuário cadastrado!');
      setNomeCompleto(''); setEmail(''); setUsuario(''); setSenha(''); setConfirmaSenha('');
      setIsRegistering(false);
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', err.message || 'Erro ao cadastrar');
    }
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('loggedUser');
  };

  // --- RESET DB ---
  const handleResetDB = async () => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente limpar todos os usuários e pets?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await clearDatabase();
            Alert.alert('Sucesso', 'Banco de dados limpo!');
            setUser(null);
          }
        }
      ]
    );
  };

  // --- RENDER ---
  if (!user) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {!isRegistering ? (
          <View style={styles.box}>
            <Text style={styles.title}>Login</Text>
            <TextInputBox placeholder="Usuário" value={usuario} onChangeText={setUsuario} />
            <TextInputBox placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
            <CustomButton title="Entrar" onPress={handleLogin} />
            <TouchableOpacity onPress={() => setIsRegistering(true)}>
              <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.box}>
            <Text style={styles.title}>Cadastro</Text>
            <TextInputBox placeholder="Nome Completo" value={nomeCompleto} onChangeText={setNomeCompleto} />
            <TextInputBox placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInputBox placeholder="Usuário" value={usuario} onChangeText={setUsuario} />
            <TextInputBox placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
            <TextInputBox placeholder="Confirmar senha" value={confirmaSenha} onChangeText={setConfirmaSenha} secureTextEntry />
            <CustomButton title="Cadastrar" onPress={handleRegister} />
            <TouchableOpacity onPress={() => setIsRegistering(false)}>
              <Text style={styles.link}>Voltar para Login</Text>
            </TouchableOpacity>
          </View>
        )}
        <CustomButton 
          title="🔄 Reset DB" 
          onPress={handleResetDB} 
          style={{ marginTop: 20, backgroundColor: '#FF6347' }} 
        />
      </ScrollView>
    );
  }

  // --- USUÁRIO LOGADO ---
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bem-vindo ao GastePet, {user.usuario}!</Text>
      <Text style={styles.subtitle}>Tenha um controle sobre o gasto do seu Pet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems:'center',
    justifyContent:'center',
    padding:16,
    backgroundColor:'#ADD8E6'
  },
  box: {
    width:'90%',
    padding:16,
    backgroundColor:'#fff',
    borderRadius:12,
    elevation:3
  },
  title: {
    fontSize:20,
    fontWeight:'700',
    color:'#075985',
    marginBottom:12,
    textAlign:'center'
  },
  link: {
    marginTop:8,
    color:'#075985',
    textAlign:'center',
    textDecorationLine:'underline'
  },
  welcome: {
    fontSize:22,
    fontWeight:'700',
    color:'#075985',
    textAlign:'center'
  },
  subtitle: {
    fontSize:16,
    fontWeight:'500',
    color:'#075985',
    textAlign:'center',
    marginTop:8
  }
});
