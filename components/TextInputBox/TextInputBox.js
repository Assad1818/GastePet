import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TextInputBox({ placeholder, value, onChangeText, secureTextEntry=false, keyboardType }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText} // o valor sempre vem do pai
        secureTextEntry={secureTextEntry && !showPassword} // olho controla apenas exibição
        keyboardType={keyboardType}
        placeholderTextColor="#666"
        autoCapitalize="none"
        blurOnSubmit={false}      // 🔹 evita que o teclado feche ao digitar
        returnKeyType="done"      // 🔹 tecla “Done” no teclado
      />
      {secureTextEntry && (
        <TouchableOpacity 
          style={styles.icon} 
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={showPassword ? "visibility" : "visibility-off"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 6,
    paddingRight: 10, // espaço para o ícone
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  icon: {
    padding: 4,
  },
});
