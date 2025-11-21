// screens/RegisterPetScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import TextInputBox from '../components/TextInputBox/TextInputBox';
import CustomButton from '../components/CustomButton/CustomButton';
import { AuthContext } from '../context/AuthContext';
import { addPet } from '../repository/db';
import { calcularGastosDetalhados } from '../api';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterPetScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [step, setStep] = useState(1);

  // --- PAGINA 1: Espécie ---
  const [especie, setEspecie] = useState('Cachorro'); // default
  // --- PAGINA 2: Informações do pet ---
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [idade, setIdade] = useState(''); // em anos (ex: 0.5 para 6 meses)
  const [idadeUnidade, setIdadeUnidade] = useState('anos'); // 'anos' ou 'meses' - permitimos entrada em meses
  const [porte, setPorte] = useState('Pequeno');
  const [alimentacaoTipo, setAlimentacaoTipo] = useState('');
  const [alimentacaoGastoMensal, setAlimentacaoGastoMensal] = useState('');

  // --- PAGINA 3: CUIDADOS ---
  const [vetFreq, setVetFreq] = useState('1 vez');
  const [vetCustoConsulta, setVetCustoConsulta] = useState('');
  const [vacinasStatus, setVacinasStatus] = useState(' '); // Sim/Não/Parcialmente
  const [vacinasLista, setVacinasLista] = useState([]); // checklist
  const [vacinasCustoAnual, setVacinasCustoAnual] = useState('');
  const [fazTosa, setFazTosa] = useState(' ');
  const [tosaFreq, setTosaFreq] = useState(' ');
  const [tosaCusto, setTosaCusto] = useState('');
  const [higieneMensal, setHigieneMensal] = useState('');
  const [usaMedicamentos, setUsaMedicamentos] = useState(' ');
  const [medicamentosLista, setMedicamentosLista] = useState([]);
  const [medicamentosCusto, setMedicamentosCusto] = useState('');

  // --- PAGINA 4: EXTRAS ---
  const [acessorios, setAcessorios] = useState([]); // [{ nome, custoAnual }]
  const [servicos, setServicos] = useState([]); // [{ nome, frequenciaTipo, frequenciaNum, custo }]

  // resultado calculado
  const [resultado, setResultado] = useState(null);
  const [saving, setSaving] = useState(false);

  // util: opções condicionais
  const racasPorEspecie = {
    Cachorro: ['Labrador','Bulldog Francês','Golden Retriever','Poodle','Shih-tzu','Pinscher','Dog Alemão','Pastor Alemão','Vira Lata','Outros'],
    Gato: ['Persa','Siamês','Maine Coon','Bengal','British Shorthair','Vira Lata','Outros'],
    Ave: ['Calopsita','Agapornis','Periquito','Papagaio','Canário','Outros']
  };

  const alimentacaoOptions = [
    'Ração comum econômica',
    'Ração premium',
    'Ração super premium',
    'Ração medicamentosa',
    'Alimentação natural (AN)',
    'Mistura de ração + alimentação natural',
    'Sementes' // só para aves (frontend condicional)
  ];

  const toggleChecklist = (list, setList, value) => {
    if (list.includes(value)) setList(list.filter(i=>i!==value));
    else setList([...list, value]);
  };

  // converter idade input para anos (float)
  const idadeEmAnos = () => {
    const val = Number(idade) || 0;
    if (idadeUnidade === 'meses') {
      return +(val / 12);
    }
    return +val;
  };

  const next = () => {
    // validações mínimas por step
    if (step === 1) {
      if (!especie) return Alert.alert('Erro', 'Selecione a espécie.');
      setStep(2); return;
    }
    if (step === 2) {
      if (!nome) return Alert.alert('Erro', 'Informe o nome do pet.');
      if (!raca) return Alert.alert('Erro', 'Selecione a raça.');
      if (!idade) return Alert.alert('Erro', 'Informe a idade.');
      // porte: para gato porte único pode ser mantido
      setStep(3); return;
    }
    if (step === 3) {
      // validações leves
      if (!vetFreq) return Alert.alert('Erro', 'Informe a frequência ao veterinário.');
      setStep(4); return;
    }
  };

  const back = () => {
    if (step > 1) setStep(step-1);
  };

  const calcularEPrepararSalvar = async () => {
    // montar objeto do pet
    const petProfile = {
      especie,
      nome,
      raca,
      idade: idadeEmAnos(),
      porte,
      alimentacao: {
        tipo: alimentacaoTipo,
        gastoMensal: alimentacaoGastoMensal ? Number(alimentacaoGastoMensal) : null,
        snacksMensal: null
      },
      vet: {
        freqAno: vetFreq,
        custoConsulta: vetCustoConsulta ? Number(vetCustoConsulta) : null
      },
      vacinas: {
        status: vacinasStatus,
        lista: vacinasLista,
        custoAnual: vacinasCustoAnual ? Number(vacinasCustoAnual) : null
      },
      tosa: {
        faz: fazTosa,
        freq: tosaFreq,
        custoPorTosa: tosaCusto ? Number(tosaCusto) : null
      },
      higieneMensal: higieneMensal ? Number(higieneMensal) : null,
      medicamentos: {
        faz: usaMedicamentos,
        lista: medicamentosLista,
        custoMensal: medicamentosCusto ? Number(medicamentosCusto) : null
      },
      acessorios,
      servicos
    };

    try {
      const gastos = await calcularGastosDetalhados(petProfile);
      setResultado({ petProfile, gastos });
      // não salva ainda — espera confirmação do usuário
      setStep(5); // passo 5 = resumo
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Falha ao calcular os gastos.');
    }
  };

  const confirmarSalvar = async () => {
    if (!user) return Alert.alert('Erro', 'Você precisa estar logado para salvar pets.');
    if (!resultado) return Alert.alert('Erro','Calcule os gastos antes de salvar.');
    setSaving(true);
    try {
      const payload = {
        usuario: user.usuario,
        ...resultado.petProfile,
        gastos: resultado.gastos
      };
      const saved = await addPet(payload);
      setSaving(false);
      Alert.alert('Sucesso', 'Pet salvo com sucesso!');
      // resetar formulário
      resetForm();
    } catch (err) {
      setSaving(false);
      console.log(err);
      Alert.alert('Erro', 'Não foi possível salvar o pet.');
    }
  };

  const resetForm = () => {
    setStep(1);
    setEspecie('Cachorro');
    setNome(''); setRaca(''); setIdade(''); setIdadeUnidade('anos'); setPorte('Pequeno');
    setAlimentacaoTipo(''); setAlimentacaoGastoMensal('');
    setVetFreq('1 vez'); setVetCustoConsulta('');
    setVacinasStatus('Sim'); setVacinasLista([]); setVacinasCustoAnual('');
    setFazTosa(' '); setTosaFreq('Mensal'); setTosaCusto('');
    setHigieneMensal(''); setUsaMedicamentos(' '); setMedicamentosLista([]); setMedicamentosCusto('');
    setAcessorios([]); setServicos([]); setResultado(null);
  };

  // helpers to add acessorio / servico quickly (UI minimal)
  const addAcessorio = (nome, custoAnual) => {
    if (!nome) return;
    setAcessorios([...acessorios, { nome, custoAnual: Number(custoAnual || 0) }]);
  };
  const removeAcessorio = (index) => setAcessorios(acessorios.filter((_,i)=>i!==index));
  const addServico = (nome, freqTipo, freqNum, custo) => {
    if (!nome) return;
    setServicos([...servicos, { nome, frequenciaTipo: freqTipo, frequenciaNum: freqNum, custo: Number(custo||0) }]);
  };
  const removeServico = (index) => setServicos(servicos.filter((_,i)=>i!==index));

  // --- RENDER functions for pages ---
  const Page1 = () => (
    <View style={styles.box}>
      <Text style={styles.label}>Selecione a espécie do seu animal:</Text>
      {['Cachorro','Gato','Ave'].map(s => (
        <TouchableOpacity key={s} style={[styles.option, especie===s && styles.optionActive]} onPress={()=>setEspecie(s)}>
          <Text style={styles.optionText}>{s}</Text>
          {especie === s && <MaterialIcons name="check-circle" size={18} color="#ff7a00" />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const Page2 = () => (
    <View style={styles.box}>
      <Text style={styles.label}>Nome</Text>
      <TextInputBox placeholder="Nome do pet" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Raça</Text>
      {/* dropdown simples */}
      <View style={{ marginBottom: 8 }}>
        {racasPorEspecie[especie].map(r => (
          <TouchableOpacity key={r} style={[styles.option, raca===r && styles.optionActive]} onPress={()=>setRaca(r)}>
            <Text style={styles.optionText}>{r}</Text>
            {raca===r && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Idade</Text>
      <TextInputBox placeholder="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" />
        <View style={{ width:12 }} />
      <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
        <TouchableOpacity style={[styles.smallBtn, idadeUnidade==='anos' && styles.smallBtnActive]} onPress={()=>setIdadeUnidade('anos')}>
          <Text>Anos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.smallBtn, idadeUnidade==='meses' && styles.smallBtnActive]} onPress={()=>setIdadeUnidade('meses')}>
          <Text>Meses</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Porte / Tamanho</Text>
      {especie === 'Cachorro' ? (
        ['Pequeno','Médio','Grande'].map(p => (
          <TouchableOpacity key={p} style={[styles.option, porte===p && styles.optionActive]} onPress={()=>setPorte(p)}>
            <Text style={styles.optionText}>{p}</Text>
            {porte===p && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        ))
      ) : especie === 'Gato' ? (
        <Text style={styles.small}>Gatos: porte único (opcional perguntar peso)</Text>
      ) : (
        ['Pequeno','Médio','Grande'].map(p => (
          <TouchableOpacity key={p} style={[styles.option, porte===p && styles.optionActive]} onPress={()=>setPorte(p)}>
            <Text style={styles.optionText}>{p}</Text>
            {porte===p && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.label}>Tipo de alimentação</Text>
      {alimentacaoOptions.map(opt => {
        if (opt === 'Sementes' && especie !== 'Ave') return null;
        return (
          <TouchableOpacity key={opt} style={[styles.option, alimentacaoTipo===opt && styles.optionActive]} onPress={()=>setAlimentacaoTipo(opt)}>
            <Text style={styles.optionText}>{opt}</Text>
            {alimentacaoTipo===opt && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        );
      })}

      <Text style={styles.label}>Quanto você gasta por mês em alimentação? (opcional)</Text>
      <TextInputBox placeholder="R$" value={alimentacaoGastoMensal} onChangeText={setAlimentacaoGastoMensal} keyboardType="numeric" />
    </View>
  );

  const Page3 = () => (
    <View style={styles.box}>
      <Text style={styles.label}>Frequência de veterinário por ano</Text>
      {['1 vez','2 vezes','3–5 vezes','6+ vezes','Só em emergência'].map(f => (
        <TouchableOpacity key={f} style={[styles.option, vetFreq===f && styles.optionActive]} onPress={()=>setVetFreq(f)}>
          <Text style={styles.optionText}>{f}</Text>
          {vetFreq===f && <MaterialIcons name="check" size={16} color="#075985" />}
        </TouchableOpacity>
      ))}
      <Text style={styles.label}>Quanto costuma gastar em cada consulta? (R$)</Text>
      <TextInputBox placeholder="R$ por consulta" value={vetCustoConsulta} onChangeText={setVetCustoConsulta} keyboardType="numeric" />
      <Text style={styles.label}>Vacinação</Text>
      {['Sim','Não','Parcialmente'].map(v => (
        <TouchableOpacity key={v} style={[styles.option, vacinasStatus===v && styles.optionActive]} onPress={()=>setVacinasStatus(v)}>
          <Text style={styles.optionText}>{v}</Text>
          {vacinasStatus===v && <MaterialIcons name="check" size={16} color="#075985" />}
        </TouchableOpacity>
      ))}

      {(vacinasStatus === 'Sim' || vacinasStatus === 'Parcialmente') && (
        <>
          <Text style={styles.label}>Quais vacinas recebeu no último ano? (marque)</Text>
          {especie === 'Cachorro' && ['V8/V10','Antirrábica','Gripe Canina','Giardia'].map(item => (
            <TouchableOpacity key={item} style={[styles.option, vacinasLista.includes(item) && styles.optionActive]} onPress={()=>toggleChecklist(vacinasLista, setVacinasLista, item)}>
              <Text style={styles.optionText}>{item}</Text>
              {vacinasLista.includes(item) && <MaterialIcons name="check" size={16} color="#075985" />}
            </TouchableOpacity>
          ))}
          {especie === 'Gato' && ['V3/V4/V5','Antirrábica'].map(item => (
            <TouchableOpacity key={item} style={[styles.option, vacinasLista.includes(item) && styles.optionActive]} onPress={()=>toggleChecklist(vacinasLista, setVacinasLista, item)}>
              <Text style={styles.optionText}>{item}</Text>
              {vacinasLista.includes(item) && <MaterialIcons name="check" size={16} color="#075985" />}
            </TouchableOpacity>
          ))}
          {especie === 'Ave' && (
            <TouchableOpacity style={[styles.option, vacinasLista.includes('Controle anual') && styles.optionActive]} onPress={()=>toggleChecklist(vacinasLista, setVacinasLista, 'Controle anual')}>
              <Text style={styles.optionText}>Realiza controle veterinário anual?</Text>
              {vacinasLista.includes('Controle anual') && <MaterialIcons name="check" size={16} color="#075985" />}
            </TouchableOpacity>
          )}

          <Text style={styles.label}>Quanto costuma gastar com vacinação anual? (R$)</Text>
          <TextInputBox placeholder="R$ anual" value={vacinasCustoAnual} onChangeText={setVacinasCustoAnual} keyboardType="numeric" />
        </>
      )}

      <Text style={styles.label}>Tosa</Text>
      <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
        <TouchableOpacity
          style={[styles.optionSmall, fazTosa && styles.optionActive]}
          onPress={() => setFazTosa(true)}
        >
          <Text style={styles.optionText}>Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionSmall, !fazTosa && styles.optionActive]}
          onPress={() => setFazTosa(false)}
        >
          <Text style={styles.optionText}>Não</Text>
        </TouchableOpacity>
      </View>


      {fazTosa && (
        <>
          <Text style={styles.label}>Qual a frequência?</Text>
          {['Semanal','Quinzenal','Mensal','Bimestral'].map(f => (
            <TouchableOpacity key={f} style={[styles.option, tosaFreq===f && styles.optionActive]} onPress={()=>setTosaFreq(f)}>
              <Text style={styles.optionText}>{f}</Text>
              {tosaFreq===f && <MaterialIcons name="check" size={16} color="#075985" />}
            </TouchableOpacity>
          ))}
          <Text style={styles.label}>Quanto custa cada tosa? (R$)</Text>
          <TextInputBox placeholder="R$ por tosa" value={tosaCusto} onChangeText={setTosaCusto} keyboardType="numeric" />
        </>
      )}

      <Text style={styles.label}>Quanto gasta por mês com itens de higiene (areia, serragem, tapete, etc.)? (R$)</Text>
      <TextInputBox placeholder="R$ mês" value={higieneMensal} onChangeText={setHigieneMensal} keyboardType="numeric" />

      <Text style={styles.label}>Medicamentos (uso regular)?</Text>
      <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
        <TouchableOpacity
          style={[styles.optionSmall, usaMedicamentos && styles.optionActive]}
          onPress={() => setUsaMedicamentos(true)}
        >
          <Text style={styles.optionText}>Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionSmall, !usaMedicamentos && styles.optionActive]}
          onPress={() => setUsaMedicamentos(false)}
        >
          <Text style={styles.optionText}>Não</Text>
        </TouchableOpacity>
      </View>

      {usaMedicamentos && (
        <>
          <Text style={styles.label}>Quais tipos?</Text>
          {['Antipulgas','Vermífugo','Controlados','Outros'].map(m => (
            <TouchableOpacity key={m} style={[styles.option, medicamentosLista.includes(m) && styles.optionActive]} onPress={()=>toggleChecklist(medicamentosLista, setMedicamentosLista, m)}>
              <Text style={styles.optionText}>{m}</Text>
              {medicamentosLista.includes(m) && <MaterialIcons name="check" size={16} color="#075985" />}
            </TouchableOpacity>
          ))}
          <Text style={styles.label}>Quanto gasta em média por mês ou por ciclo? (R$)</Text>
          <TextInputBox placeholder="R$ mês" value={medicamentosCusto} onChangeText={setMedicamentosCusto} keyboardType="numeric" />
        </>
      )}
    </View>
  );

  const Page4 = () => {
    // Quick UI: allow user to add accessory & service via simple inline prompts (could be improved)
    const [accNome, setAccNome] = useState('');
    const [accCusto, setAccCusto] = useState('');
    const [srvNome, setSrvNome] = useState('');
    const [srvFreqTipo, setSrvFreqTipo] = useState('mensal');
    const [srvFreqNum, setSrvFreqNum] = useState('1');
    const [srvCusto, setSrvCusto] = useState('');

    return (
      <ScrollView style={{ width:'100%' }}>
        <View style={styles.box}>
          <Text style={styles.label}>Acessórios e manutenção (gasto médio por ano)</Text>
          <Text style={styles.small}>Adicione nome e custo anual aproximado</Text>
          <View style={{ marginTop:8 }}>
            <TextInputBox placeholder="Nome do acessório (ex: Camas)" value={accNome} onChangeText={setAccNome} />
            <TextInputBox placeholder="Custo anual R$" value={accCusto} onChangeText={setAccCusto} keyboardType="numeric" />
            <CustomButton title="Adicionar acessório" onPress={() => { addAcessorio(accNome, accCusto); setAccNome(''); setAccCusto(''); }} />
            {acessorios.map((a,i)=>(
              <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6 }}>
                <Text>{a.nome} — R$ {a.custoAnual}</Text>
                <TouchableOpacity onPress={()=>removeAcessorio(i)}><MaterialIcons name="delete" size={20} color="#e63946" /></TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={[styles.label, { marginTop:12 }]}>Serviços extras</Text>
          <Text style={styles.small}>Daycare, pet sitter, adestramento, banho semanal, passeador, hotel</Text>
          <View style={{ marginTop:8 }}>
            <TextInputBox placeholder="Nome do serviço (ex: Daycare)" value={srvNome} onChangeText={setSrvNome} />
            <Text style={styles.small}>Frequência tipo</Text>
            <View style={{ flexDirection:'row' }}>
              {['dia','semana','mensal'].map(t => (
                <TouchableOpacity key={t} style={[styles.optionSmall, srvFreqTipo===t && styles.optionSmallActive]} onPress={()=>setSrvFreqTipo(t)}>
                  <Text>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInputBox placeholder="Quantidade (ex: 1 vez por semana -> 1)" value={srvFreqNum} onChangeText={setSrvFreqNum} keyboardType="numeric" />
            <TextInputBox placeholder="Custo unitário R$" value={srvCusto} onChangeText={setSrvCusto} keyboardType="numeric" />
            <CustomButton title="Adicionar serviço" onPress={() => { addServico(srvNome, srvFreqTipo, srvFreqNum, srvCusto); setSrvNome(''); setSrvFreqNum('1'); setSrvCusto(''); }} />
            {servicos.map((s,i)=>(
              <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6 }}>
                <Text>{s.nome} — {s.frequenciaNum} {s.frequenciaTipo} — R$ {s.custo}</Text>
                <TouchableOpacity onPress={()=>removeServico(i)}><MaterialIcons name="delete" size={20} color="#e63946" /></TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const SummaryPage = () => {
    if (!resultado) return (
      <View style={styles.box}>
        <Text style={styles.title}>Resumo</Text>
        <Text>Calcule os gastos antes de salvar.</Text>
      </View>
    );

    const { petProfile, gastos } = resultado;
    return (
      <View style={styles.box}>
        <Text style={styles.title}>Resumo Final</Text>
        <Text style={styles.label}>Nome: {petProfile.nome}</Text>
        <Text style={styles.label}>Espécie: {petProfile.especie} — Raça: {petProfile.raca}</Text>
        <Text style={styles.label}>Idade: {petProfile.idade} anos — Porte: {petProfile.porte}</Text>

        <Text style={[styles.label, { marginTop:8 }]}>Detalhamento mensal:</Text>
        <Text>Ração: R$ {gastos.racao.toFixed(2)}</Text>
        <Text>Vacinas (mensal): R$ {gastos.vacinas.toFixed(2)}</Text>
        <Text>Petshop (banho+tosa+higiene): R$ {gastos.petshop.toFixed(2)}</Text>
        <Text>Veterinário: R$ {gastos.veterinario.toFixed(2)}</Text>
        <Text>Medicamentos: R$ {gastos.medicamentos.toFixed(2)}</Text>
        <Text>Serviços extras: R$ {gastos.servicos.toFixed(2)}</Text>
        <Text>Acessórios (média mensal): R$ {gastos.acessorios.toFixed(2)}</Text>
        <Text style={[styles.label, { marginTop:8, fontWeight:'700' }]}>Total mensal: R$ {gastos.totalMensal.toFixed(2)}</Text>
        <Text style={styles.small}>Total anual (estimado): R$ {gastos.totalAnual.toFixed(2)}</Text>

        <CustomButton title={saving ? "Salvando..." : "Salvar Pet"} onPress={confirmarSalvar} disabled={saving} />
      </View>
    );
  };

  // render main
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cadastro de Pet — Etapa {step <=4 ? step : 'Resumo'}</Text>

      <ScrollView contentContainerStyle={{ alignItems:'center', paddingBottom:24 }}>
        {step === 1 && <Page1 />}
        {step === 2 && <Page2 />}
        {step === 3 && <Page3 />}
        {step === 4 && <Page4 />}
        {step === 5 && <SummaryPage />}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && <CustomButton title="Voltar" onPress={back} style={{ backgroundColor:'#aaa', marginRight:8 }} />}
        {step <= 3 && <CustomButton title="Próximo" onPress={next} />}
        {step === 4 && <CustomButton title="Calcular gastos" onPress={calcularEPrepararSalvar} />}
        {step === 5 && <CustomButton title="Editar" onPress={()=>setStep(1)} style={{ backgroundColor:'#ddd' }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#ADD8E6' },
  header: { padding:12, fontSize:18, fontWeight:'700', color:'#075985', textAlign:'center', backgroundColor:'#ADD8E6' },
  box: { width:'92%', marginTop:12, padding:12, backgroundColor:'#fff', borderRadius:10, elevation:2 },
  title: { fontSize:18, fontWeight:'700', color:'#075985', marginBottom:8 },
  label: { fontSize:18, marginTop:13, color:'#333', fontWeight: '700' },
  small: { fontSize:12, color:'#666', marginTop:6 },
  option: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:10, borderWidth:1, borderColor:'#eee', borderRadius:8, marginTop:6, backgroundColor:'#fff' },
  optionActive: { borderColor:'#ff7a00', backgroundColor:'#fff9f2' },
  optionText: { fontSize:13 },
  optionSmall: { padding:8, borderWidth:1, borderColor:'#eee', borderRadius:8, marginRight:8, backgroundColor:'#fff' },
  optionSmallActive: { borderColor:'#075985', backgroundColor:'#f0f7ff' },
  footer: { flexDirection:'row', justifyContent:'center', padding:12, gap:8 },
  smallBtn: { padding:8, borderWidth:1, borderColor:'#eee', borderRadius:6 },
  smallBtnActive: { backgroundColor:'#fff9f2', borderColor:'#ff7a00' }
});
