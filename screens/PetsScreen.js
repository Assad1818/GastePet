import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getPets, deletePet } from '../repository/db';
import { AuthContext } from '../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { calcularGastoMedio } from '../api';

export default function PetsScreen() {
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [gastos, setGastos] = useState({});
  const [totalGasto, setTotalGasto] = useState(0);
  const isFocused = useIsFocused();

  const loadPets = async () => {
    try {
      const list = user ? await getPets(user.usuario) : [];
      setPets(list);

      const novosGastos = {};
      let total = 0;
      for (let pet of list) {
        const gasto = await calcularGastoMedio(pet.raca, Number(pet.idade), pet.porte);
        novosGastos[pet.id] = gasto;
        total += gasto.total;
      }
      setGastos(novosGastos);
      setTotalGasto(total);
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível carregar os pets ou calcular gastos.');
    }
  };

  useEffect(() => {
    loadPets();
  }, [isFocused, user]);

  const handleDelete = async (id) => {
    if (!user) return Alert.alert('Erro', 'Você precisa estar logado para deletar pets.');

    Alert.alert('Confirmar', 'Deseja deletar este pet?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePet(id, user.usuario);
            loadPets();
          } catch (err) {
            console.log(err);
            Alert.alert('Erro', 'Erro ao deletar pet.');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {pets.length === 0 ? (
        <Text style={styles.title}>Nenhum pet cadastrado.</Text>
      ) : (
        <>
          <Text style={styles.title}>Pets Cadastrados</Text>
          <FlatList
            data={pets}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              let idadeTexto = '';
              if (item.idade < 1) {
                idadeTexto = `${Math.round(item.idade * 12)} meses`;
              } else if (item.idade === 1) {
                idadeTexto = '1 ano';
              } else {
                idadeTexto = `${item.idade} anos`;
              }

              const gasto = gastos[item.id] || { racao:0, vacinas:0, banho:0, total:0 };

              return (
                <View style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.nome} ({idadeTexto})</Text>
                    <Text style={styles.meta}>{item.raca} • {item.porte}</Text>
                    <Text style={styles.gasto}>Ração: R$ {gasto.racao.toFixed(2)}</Text>
                    <Text style={styles.gasto}>Vacinas: R$ {gasto.vacinas.toFixed(2)}</Text>
                    <Text style={styles.gasto}>Petshop: R$ {gasto.banho.toFixed(2)}</Text>
                    <Text style={[styles.gasto, { fontWeight:'700' }]}>Total: R$ {gasto.total.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <MaterialIcons name="delete" size={28} color="#e63946" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <Text style={styles.total}>💰 Gasto total dos pets: R$ {totalGasto.toFixed(2)}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#ADD8E6' },
  title: { fontSize:20, fontWeight:'700', color:'#075985', marginBottom:12, alignSelf:'center' },
  item: { flexDirection:'row', alignItems:'center', padding:12, borderRadius:8, backgroundColor:'#fff', marginBottom:10, borderWidth:1, borderColor:'#eee' },
  name: { fontSize:16, fontWeight:'700' },
  meta: { color:'#555' },
  gasto: { color:'#FF7A00', marginTop:4, fontWeight:'600' },
  total: { marginTop:12, fontSize:18, fontWeight:'700', textAlign:'center', color:'#FF7A00' }
});
