import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TextInputBox from '../../components/TextInputBox/TextInputBox';
import CustomButton from '../../components/CustomButton/CustomButton';
import { MaterialIcons } from '@expo/vector-icons';

const Page4 = forwardRef((props, ref) => {
  const [acessorios, setAcessorios] = useState([]);
  const [accNome, setAccNome] = useState('');
  const [accCusto, setAccCusto] = useState('');

  const [servicos, setServicos] = useState([]);
  const [srvNome, setSrvNome] = useState('');
  const [srvFreqTipo, setSrvFreqTipo] = useState('mensal');
  const [srvFreqNum, setSrvFreqNum] = useState('1');
  const [srvCusto, setSrvCusto] = useState('');

  useImperativeHandle(ref, () => ({
    getData: async () => {
      return { acessorios, servicos };
    }
  }));

  const addAcessorio = () => {
    if (!accNome) return;
    setAcessorios(a => [...a, { nome: accNome.trim(), custoAnual: Number(accCusto) || 0 }]);
    setAccNome(''); setAccCusto('');
  };

  const removeAcessorio = (index) => setAcessorios(a => a.filter((_,i) => i !== index));

  const addServico = () => {
    if (!srvNome) return;
    setServicos(s => [...s, { nome: srvNome.trim(), frequenciaTipo: srvFreqTipo, frequenciaNum: Number(srvFreqNum) || 1, custo: Number(srvCusto) || 0 }]);
    setSrvNome(''); setSrvFreqNum('1'); setSrvCusto('');
  };

  const removeServico = (index) => setServicos(s => s.filter((_,i) => i !== index));

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Acessórios e manutenção (gasto médio por ano)</Text>
      <View style={{ marginTop: 8 }}>
        <TextInputBox placeholder="Nome do acessório (ex: Camas)" value={accNome} onChangeText={setAccNome} />
        <TextInputBox placeholder="Custo anual R$" value={accCusto} onChangeText={setAccCusto} keyboardType="numeric" />
        <CustomButton title="Adicionar acessório" onPress={addAcessorio} />
        {acessorios.map((a,i)=>(
          <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6 }}>
            <Text>{a.nome} — R$ {a.custoAnual}</Text>
            <TouchableOpacity onPress={()=>removeAcessorio(i)}><MaterialIcons name="delete" size={20} color="#e63946" /></TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 12 }]}>Serviços extras</Text>
      <Text style={styles.small}>Daycare, pet sitter, adestramento, banho semanal, passeador, hotel</Text>
      <View style={{ marginTop: 8 }}>
        <TextInputBox placeholder="Nome do serviço" value={srvNome} onChangeText={setSrvNome} />
        <Text style={styles.small}>Frequência</Text>
        <View style={{ flexDirection:'row' }}>
          {['dia','semana','mensal'].map(t => (
            <TouchableOpacity key={t} style={[styles.optionSmall, srvFreqTipo===t && styles.optionSmallActive]} onPress={()=>setSrvFreqTipo(t)}>
              <Text>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInputBox placeholder="Quantidade (ex: 1 vez por semana -> 1)" value={srvFreqNum} onChangeText={setSrvFreqNum} keyboardType="numeric" />
        <TextInputBox placeholder="Custo unitário R$" value={srvCusto} onChangeText={setSrvCusto} keyboardType="numeric" />
        <CustomButton title="Adicionar serviço" onPress={addServico} />
        {servicos.map((s,i)=>(
          <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6 }}>
            <Text>{s.nome} — {s.frequenciaNum} {s.frequenciaTipo} — R$ {s.custo}</Text>
            <TouchableOpacity onPress={()=>removeServico(i)}><MaterialIcons name="delete" size={20} color="#e63946" /></TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  box: { width: '92%', marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  label: { fontSize: 18, marginTop: 13, color: '#333', fontWeight: '700' },
  small: { fontSize: 12, color: '#666', marginTop: 6 },
  optionSmall: { padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginRight: 8, backgroundColor: '#fff' },
  optionSmallActive: { borderColor: '#075985', backgroundColor: '#f0f7ff' },
});

export default Page4;