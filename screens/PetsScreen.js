import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getPets, deletePet } from '../repository/db';
import { AuthContext } from '../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { calcularGastosDetalhados } from '../api';

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
        const gasto = await calcularGastosDetalhados({
          especie: pet.especie,
          raca: pet.raca,
          idade: Number(pet.idade),
          porte: pet.porte,
          alimentacao: {},
          vacinas: {},
          tosa: {},
          vet: {},
          medicamentos: {},
          servicos: [],
          acessorios: []
        });

        novosGastos[pet.id] = gasto;
        total += gasto.totalMensal;
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
              const g = gastos[item.id];

              return (
                <View style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.nome}</Text>
                    <Text style={styles.meta}>{item.raca} • {item.porte}</Text>

                    {g ? (
                      <>
                        {g.racao > 0 && (
                          <Text style={styles.gasto}>Ração: R$ {g.racao.toFixed(2)}</Text>
                        )}
                        {g.vacinas > 0 && (
                          <Text style={styles.gasto}>Vacinas: R$ {g.vacinas.toFixed(2)}</Text>
                        )}
                        {g.petshop > 0 && (
                          <Text style={styles.gasto}>Petshop: R$ {g.petshop.toFixed(2)}</Text>
                        )}
                        {g.veterinario > 0 && (
                          <Text style={styles.gasto}>Veterinário: R$ {g.veterinario.toFixed(2)}</Text>
                        )}
                        {g.medicamentos > 0 && (
                          <Text style={styles.gasto}>Medicamentos: R$ {g.medicamentos.toFixed(2)}</Text>
                        )}
                        {g.servicos > 0 && (
                          <Text style={styles.gasto}>Serviços extras: R$ {g.servicos.toFixed(2)}</Text>
                        )}
                        {g.acessorios > 0 && (
                          <Text style={styles.gasto}>Acessórios: R$ {g.acessorios.toFixed(2)}</Text>
                        )}

                        <Text style={[styles.gasto, { fontWeight: '700', marginTop: 6 }]}>
                          Total mensal: R$ {g.totalMensal.toFixed(2)}
                        </Text>
                        <Text style={[styles.total_anual, { marginTop: 2 }]}>
                          Total anual: R$ {g.totalAnual.toFixed(2)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.meta}>Calculando gastos...</Text>
                    )}
                  </View>

                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <MaterialIcons name="delete" size={28} color="#e63946" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />

          <Text style={styles.total}>💰 Gasto mensal total dos pets: R$ {totalGasto.toFixed(2)}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ADD8E6' },
  title: { fontSize: 20, fontWeight: '700', color: '#075985', marginBottom: 12, alignSelf: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#555' },
  gasto: { color: '#FF7A00', marginTop: 4, fontWeight: '600' },
  total: { marginTop: 12, fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#FF7A00' },
  total_anual: {color: '#1c0819ff', fontSize: 18, fontWeight: '700'}
});
