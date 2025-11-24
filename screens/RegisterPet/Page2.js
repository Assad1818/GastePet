import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TextInputBox from '../../components/TextInputBox/TextInputBox';
import { MaterialIcons } from '@expo/vector-icons';

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
  'Alimentação natural',
  'Mistura de ração + alimentação natural',
  'Sementes'
];

const Page2 = forwardRef(({ especie }, ref) => {

  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [idade, setIdade] = useState('');
  const [idadeUnidade, setIdadeUnidade] = useState('anos');
  const [porte, setPorte] = useState('Pequeno');
  const [alimentacaoTipo, setAlimentacaoTipo] = useState('');
  const [alimentacaoGastoMensal, setAlimentacaoGastoMensal] = useState('');

  useImperativeHandle(ref, () => ({
    getData: async () => {
      if (!nome) throw new Error('Informe o nome do pet.');
      if (!raca) throw new Error('Selecione a raça.');
      if (!idade) throw new Error('Informe a idade.');

      return {
        nome: nome.trim(),
        raca,
        idade: Number(idade) || 0,
        idadeEmAnos: idadeUnidade === 'meses' ? Number(idade) / 12 : Number(idade),
        porte,
        alimentacaoTipo,
        alimentacaoGastoMensal: alimentacaoGastoMensal ? Number(alimentacaoGastoMensal) : null,
      };
    }
  }));

  const racas = useMemo(() => racasPorEspecie[especie] || [], [especie]);

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Nome</Text>
      <TextInputBox placeholder="Nome do pet" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Raça</Text>
      <View style={{ marginBottom: 8 }}>
        {racas.map(r => (
          <TouchableOpacity key={r} style={[styles.option, raca === r && styles.optionActive]} onPress={() => setRaca(r)}>
            <Text style={styles.optionText}>{r}</Text>
            {raca === r && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Idade</Text>
      <TextInputBox placeholder="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TouchableOpacity style={[styles.smallBtn, idadeUnidade === 'anos' && styles.smallBtnActive]} onPress={() => setIdadeUnidade('anos')}>
          <Text>Anos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.smallBtn, idadeUnidade === 'meses' && styles.smallBtnActive]} onPress={() => setIdadeUnidade('meses')}>
          <Text>Meses</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Porte / Tamanho</Text>
      {especie === 'Cachorro' ? (
        ['Pequeno','Médio','Grande'].map(p => (
          <TouchableOpacity key={p} style={[styles.option, porte === p && styles.optionActive]} onPress={() => setPorte(p)}>
            <Text style={styles.optionText}>{p}</Text>
            {porte === p && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        ))
      ) : especie === 'Gato' ? (
        <Text style={styles.small}>Gatos: porte único</Text>
      ) : (
        ['Pequeno','Médio','Grande'].map(p => (
          <TouchableOpacity key={p} style={[styles.option, porte === p && styles.optionActive]} onPress={() => setPorte(p)}>
            <Text style={styles.optionText}>{p}</Text>
            {porte === p && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.label}>Tipo de alimentação</Text>
      {alimentacaoOptions.map(opt => {
        if (opt === 'Sementes' && especie !== 'Ave') return null;
        return (
          <TouchableOpacity key={opt} style={[styles.option, alimentacaoTipo === opt && styles.optionActive]} onPress={() => setAlimentacaoTipo(opt)}>
            <Text style={styles.optionText}>{opt}</Text>
            {alimentacaoTipo === opt && <MaterialIcons name="check" size={16} color="#075985" />}
          </TouchableOpacity>
        );
      })}

      <Text style={styles.label}>Quanto você gasta por mês em alimentação? (opcional)</Text>
      <TextInputBox placeholder="R$" value={alimentacaoGastoMensal} onChangeText={setAlimentacaoGastoMensal} keyboardType="numeric" />
    </View>
  );
});

const styles = StyleSheet.create({
  box: { width: '92%', marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  label: { fontSize: 18, marginTop: 13, color: '#333', fontWeight: '700' },
  small: { fontSize: 12, color: '#666', marginTop: 6 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginTop: 6, backgroundColor: '#fff' },
  optionActive: { borderColor: '#ff7a00', backgroundColor: '#fff9f2' },
  optionText: { fontSize: 13 },
  smallBtn: { padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 6, marginRight: 8 },
  smallBtnActive: { backgroundColor: '#fff9f2', borderColor: '#ff7a00' },
});

export default Page2;