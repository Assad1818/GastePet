import React, { useRef, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Page1 from './RegisterPet/Page1';
import Page2 from './RegisterPet/Page2';
import Page3 from './RegisterPet/Page3';
import Page4 from './RegisterPet/Page4';
import CustomButton from '../components/CustomButton/CustomButton';
import { AuthContext } from '../context/AuthContext';
import { addPet } from '../repository/db';
import { calcularGastosDetalhados } from '../api';

export default function RegisterPetScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [especie, setEspecie] = useState('Cachorro');
  const [resultado, setResultado] = useState(null);
  const [saving, setSaving] = useState(false);

  // refs para acessar métodos expostos pelas pages
  const page2Ref = useRef(null);
  const page3Ref = useRef(null);
  const page4Ref = useRef(null);

  // **Estados levantados para manter valores ao navegar**
  const [page2State, setPage2State] = useState({
    nome: '',
    raca: '',
    idade: '',
    idadeUnidade: 'anos',
    porte: 'Pequeno',
    alimentacaoTipo: '',
    alimentacaoGastoMensal: ''
  });

  const [page3State, setPage3State] = useState({
    vetFreq: '1 vez',
    vetCustoConsulta: '',
    vacinasStatus: 'Sim',
    vacinasLista: [],
    vacinasCustoAnual: '',
    fazTosa: false,
    tosaFreq: 'Mensal',
    tosaCusto: '',
    higieneMensal: '',
    usaMedicamentos: false,
    medicamentosLista: [],
    medicamentosCusto: ''
  });

  const [page4State, setPage4State] = useState({
    acessorios: [],
    servicos: []
  });

  const onNext = useCallback(async () => {
    try {
      if (step === 1) {
        if (!especie) return Alert.alert('Erro', 'Selecione a espécie.');
        setStep(2);
        return;
      }

      if (step === 2) {
        if (!page2Ref.current) return Alert.alert('Erro', 'Página 2 ainda não carregou');
        const data = await page2Ref.current.getData();
        setPage2State(data);
        setStep(3);
        return;
      }

      if (step === 3) {
        if (!page3Ref.current) return Alert.alert('Erro', 'Página 3 ainda não carregou');
        const data = await page3Ref.current.getData();
        setPage3State(data);
        setStep(4);
        return;
      }

    } catch (err) {
      if (err && err.message) Alert.alert('Erro', err.message);
      else Alert.alert('Erro', 'Ocorreu um erro ao validar.');
    }
  }, [step, especie]);

  const onCalculate = useCallback(async () => {
    try {
      if (!page2Ref.current || !page3Ref.current || !page4Ref.current) {
        return Alert.alert('Erro', 'Alguma página ainda não carregou');
      }

      const page2 = await page2Ref.current.getData();
      const page3 = await page3Ref.current.getData();
      const page4 = await page4Ref.current.getData();

      const petProfile = {
        especie,
        nome: page2.nome,
        raca: page2.raca,
        idade: page2.idadeEmAnos,
        porte: page2.porte,
        alimentacao: {
          tipo: page2.alimentacaoTipo,
          gastoMensal: page2.alimentacaoGastoMensal || null,
        },
        vet: {
          freqAno: page3.vetFreq,
          custoConsulta: page3.vetCustoConsulta || null,
        },
        vacinas: {
          status: page3.vacinasStatus,
          lista: page3.vacinasLista,
          custoAnual: page3.vacinasCustoAnual || null,
        },
        tosa: {
          faz: page3.fazTosa,
          freq: page3.tosaFreq,
          custoPorTosa: page3.tosaCusto || null,
        },
        higieneMensal: page3.higieneMensal || null,
        medicamentos: {
          faz: page3.usaMedicamentos,
          lista: page3.medicamentosLista,
          custoMensal: page3.medicamentosCusto || null,
        },
        acessorios: page4.acessorios,
        servicos: page4.servicos,
      };

      const gastos = await calcularGastosDetalhados(petProfile);
      setResultado({ petProfile, gastos });
      setStep(5);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', err.message || 'Falha ao calcular os gastos.');
    }
  }, [especie]);

  const confirmarSalvar = useCallback(async () => {
    if (!user) return Alert.alert('Erro', 'Você precisa estar logado para salvar pets.');
    if (!resultado) return Alert.alert('Erro', 'Calcule os gastos antes de salvar.');
    setSaving(true);
    try {
      const payload = {
        usuario: user.usuario,
        ...resultado.petProfile,
        gastos: resultado.gastos,
      };
      await addPet(payload);
      setSaving(false);
      Alert.alert('Sucesso', 'Pet salvo com sucesso!');
      // reset
      setStep(1);
      setEspecie('Cachorro');
      setResultado(null);
      setPage2State({
        nome: '',
        raca: '',
        idade: '',
        idadeUnidade: 'anos',
        porte: 'Pequeno',
        alimentacaoTipo: '',
        alimentacaoGastoMensal: ''
      });
      setPage3State({
        vetFreq: '1 vez',
        vetCustoConsulta: '',
        vacinasStatus: 'Sim',
        vacinasLista: [],
        vacinasCustoAnual: '',
        fazTosa: false,
        tosaFreq: 'Mensal',
        tosaCusto: '',
        higieneMensal: '',
        usaMedicamentos: false,
        medicamentosLista: [],
        medicamentosCusto: ''
      });
      setPage4State({ acessorios: [], servicos: [] });
    } catch (err) {
      setSaving(false);
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar o pet.');
    }
  }, [user, resultado]);

  const onBack = useCallback(() => {
    if (step > 1) setStep(s => s - 1);
  }, [step]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <Text style={styles.header}>Cadastro de Pet — Etapa {step <= 4 ? step : 'Resumo'}</Text>

        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}>
          {/* Todas as páginas são renderizadas, apenas escondidas quando não estão ativas */}
          <View style={{ display: step === 1 ? 'flex' : 'none' }}>
            <Page1 especie={especie} setEspecie={setEspecie} />
          </View>

          <View style={{ display: step === 2 ? 'flex' : 'none' }}>
            <Page2
              ref={page2Ref}
              especie={especie}
              state={page2State}
              setState={setPage2State}
            />
          </View>

          <View style={{ display: step === 3 ? 'flex' : 'none' }}>
            <Page3
              ref={page3Ref}
              especie={especie}
              state={page3State}
              setState={setPage3State}
            />
          </View>

          <View style={{ display: step === 4 ? 'flex' : 'none' }}>
            <Page4
              ref={page4Ref}
              state={page4State}
              setState={setPage4State}
            />
          </View>

          {step === 5 && (
            <View style={styles.box}>
              <Text style={styles.title}>Resumo Final</Text>
              {!resultado ? (
                <Text>Calcule os gastos antes de salvar.</Text>
              ) : (
                <>
                  <Text style={styles.label}>Nome: {resultado.petProfile.nome}</Text>
                  <Text style={styles.label}>Espécie: {resultado.petProfile.especie} — Raça: {resultado.petProfile.raca}</Text>
                  <Text style={styles.label}>Idade: {resultado.petProfile.idade} anos — Porte: {resultado.petProfile.porte}</Text>

                  <Text style={[styles.label, { marginTop: 8 }]}>Detalhamento mensal:</Text>
                  <Text>Ração: R$ {resultado.gastos.racao.toFixed(2)}</Text>
                  <Text>Vacinas (mensal): R$ {resultado.gastos.vacinas.toFixed(2)}</Text>
                  <Text>Petshop (banho+tosa+higiene): R$ {resultado.gastos.petshop.toFixed(2)}</Text>
                  <Text>Veterinário: R$ {resultado.gastos.veterinario.toFixed(2)}</Text>
                  <Text>Medicamentos: R$ {resultado.gastos.medicamentos.toFixed(2)}</Text>
                  <Text>Serviços extras: R$ {resultado.gastos.servicos.toFixed(2)}</Text>
                  <Text>Acessórios (média mensal): R$ {resultado.gastos.acessorios.toFixed(2)}</Text>
                  <Text style={[styles.label, { marginTop: 8, fontWeight: '700' }]}>Total mensal: R$ {resultado.gastos.totalMensal.toFixed(2)}</Text>
                  <Text style={styles.small}>Total anual (estimado): R$ {resultado.gastos.totalAnual.toFixed(2)}</Text>

                  <CustomButton title={saving ? 'Salvando...' : 'Salvar Pet'} onPress={confirmarSalvar} disabled={saving} />
                </>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && <CustomButton title="Voltar" onPress={onBack} style={{ backgroundColor: '#aaa', marginRight: 8 }} />}
          {step <= 3 && <CustomButton title="Próximo" onPress={onNext} />}
          {step === 4 && <CustomButton title="Calcular gastos" onPress={onCalculate} />}
          {step === 5 && <CustomButton title="Editar" onPress={() => setStep(1)} style={{ backgroundColor: '#ddd' }} />}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ADD8E6' },
  header: { padding: 12, fontSize: 18, fontWeight: '700', color: '#075985', textAlign: 'center', backgroundColor: '#ADD8E6' },
  box: { width: '92%', marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: '700', color: '#075985', marginBottom: 8 },
  label: { fontSize: 18, marginTop: 13, color: '#333', fontWeight: '700' },
  small: { fontSize: 12, color: '#666', marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'center', padding: 12, gap: 8 },
});
