import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TextInputBox from '../../components/TextInputBox/TextInputBox';
import { MaterialIcons } from '@expo/vector-icons';

const Page3 = forwardRef(({ especie }, ref) => {
  const [vetFreq, setVetFreq] = useState('1 vez');
  const [vetCustoConsulta, setVetCustoConsulta] = useState('');
  const [vacinasStatus, setVacinasStatus] = useState('Sim');
  const [vacinasLista, setVacinasLista] = useState([]);
  const [vacinasCustoAnual, setVacinasCustoAnual] = useState('');
  const [fazTosa, setFazTosa] = useState(false);
  const [tosaFreq, setTosaFreq] = useState('Mensal');
  const [tosaCusto, setTosaCusto] = useState('');
  const [higieneMensal, setHigieneMensal] = useState('');
  const [usaMedicamentos, setUsaMedicamentos] = useState(false);
  const [medicamentosLista, setMedicamentosLista] = useState([]);
  const [medicamentosCusto, setMedicamentosCusto] = useState('');

  const toggleChecklist = (list, setList, value) => {
    if (list.includes(value)) setList(list.filter(i => i !== value));
    else setList([...list, value]);
  };

  useImperativeHandle(ref, () => ({
    getData: async () => {
      // validações simples
      if (!vetFreq) throw new Error('Informe a frequência ao veterinário.');
      return {
        vetFreq,
        vetCustoConsulta: vetCustoConsulta ? Number(vetCustoConsulta) : null,
        vacinasStatus,
        vacinasLista,
        vacinasCustoAnual: vacinasCustoAnual ? Number(vacinasCustoAnual) : null,
        fazTosa,
        tosaFreq,
        tosaCusto: tosaCusto ? Number(tosaCusto) : null,
        higieneMensal: higieneMensal ? Number(higieneMensal) : null,
        usaMedicamentos,
        medicamentosLista,
        medicamentosCusto: medicamentosCusto ? Number(medicamentosCusto) : null,
      };
    }
  }));

  return (
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
      <View style={{ flexDirection:'row', alignItems:'center', marginTop:8 }}>
        <TouchableOpacity style={[styles.optionSmall, fazTosa && styles.optionActive]} onPress={() => setFazTosa(true)}>
          <Text style={styles.optionText}>Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionSmall, !fazTosa && styles.optionActive]} onPress={() => setFazTosa(false)}>
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

      <Text style={styles.label}>Quanto gasta por mês com itens de higiene? (R$)</Text>
      <TextInputBox placeholder="R$ mês" value={higieneMensal} onChangeText={setHigieneMensal} keyboardType="numeric" />

      <Text style={styles.label}>Medicamentos (uso regular)?</Text>
      <View style={{ flexDirection:'row', alignItems:'center', marginTop:8 }}>
        <TouchableOpacity style={[styles.optionSmall, usaMedicamentos && styles.optionActive]} onPress={() => setUsaMedicamentos(true)}>
          <Text style={styles.optionText}>Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionSmall, !usaMedicamentos && styles.optionActive]} onPress={() => setUsaMedicamentos(false)}>
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
});

const styles = StyleSheet.create({
  box: { width: '92%', marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  label: { fontSize: 18, marginTop: 13, color: '#333', fontWeight: '700' },
  small: { fontSize: 12, color: '#666', marginTop: 6 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginTop: 6, backgroundColor: '#fff' },
  optionActive: { borderColor: '#ff7a00', backgroundColor: '#fff9f2' },
  optionText: { fontSize: 13 },
  optionSmall: { padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginRight: 8, backgroundColor: '#fff' },
});

export default Page3;