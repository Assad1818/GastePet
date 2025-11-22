import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Page1({ especie, setEspecie }) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>Selecione a espécie do seu animal:</Text>
      {['Cachorro', 'Gato', 'Ave'].map(s => (
        <TouchableOpacity key={s} style={[styles.option, especie === s && styles.optionActive]} onPress={() => setEspecie(s)}>
          <Text style={styles.optionText}>{s}</Text>
          {especie === s && <MaterialIcons name="check-circle" size={18} color="#ff7a00" />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '92%', marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  label: { fontSize: 18, marginTop: 13, color: '#333', fontWeight: '700' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginTop: 6, backgroundColor: '#fff' },
  optionActive: { borderColor: '#ff7a00', backgroundColor: '#fff9f2' },
  optionText: { fontSize: 13 },
});