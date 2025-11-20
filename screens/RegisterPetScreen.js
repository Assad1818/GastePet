import React, { useState, useContext } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import TextInputBox from '../components/TextInputBox/TextInputBox';
import CustomButton from '../components/CustomButton/CustomButton';
import { addPet } from '../repository/db';
import { calcularGastoMedio } from '../api';
import { AuthContext } from '../context/AuthContext';

export default function RegisterPetScreen() {
  const { user } = useContext(AuthContext);
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [porte, setPorte] = useState('');
  const [idade, setIdade] = useState('');
  const [gastoMedio, setGastoMedio] = useState(null);

  const handleAdd = async () => {
    if (!user) return Alert.alert('Erro', 'Você precisa estar logado para cadastrar pets.');
    if (!nome || !raca || !porte || !idade)
      return Alert.alert('Erro', 'Preencha todos os campos.');

    try {
      // Calcula gasto médio usando a API
      const gasto = await calcularGastoMedio(raca, Number(idade), porte);

      // Adiciona o pet ao banco
      await addPet({ nome, raca, porte, idade, usuario: user.usuario });

      // Atualiza estado e limpa campos
      setGastoMedio(gasto);
      setNome(''); setRaca(''); setPorte(''); setIdade('');

      Alert.alert('Sucesso', `Pet cadastrado com sucesso!\n`);
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Erro ao cadastrar pet.');
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Cadastrar Pet</Text>
          <TextInputBox placeholder="Nome" value={nome} onChangeText={setNome} />
          <TextInputBox placeholder="Raça" value={raca} onChangeText={setRaca} />
          <TextInputBox placeholder="Porte (pequeno/médio/grande)" value={porte} onChangeText={setPorte} />
          <TextInputBox placeholder="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" />
          <CustomButton title="Cadastrar Pet" onPress={handleAdd} />


        </>
      ) : (
        <Text style={styles.title}>Você precisa estar logado para cadastrar pets.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', paddingTop:24, backgroundColor:'#ADD8E6' },
  title: { fontSize:20, fontWeight:'700', color:'#075985', marginBottom:12, textAlign:'center' },
  gasto: { marginTop: 12, fontSize:16, color:'#075985', fontWeight:'700', textAlign:'center' }
});
