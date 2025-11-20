import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, Modal, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Telas
import HomeScreen from './screens/HomeScreen';
import RegisterPetScreen from './screens/RegisterPetScreen';
import PetsScreen from './screens/PetsScreen';
import { AuthContext } from './context/AuthContext';
import { getAllUsers, getPets } from './repository/db';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [alterarContaVisible, setAlterarContaVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [quantidadePets, setQuantidadePets] = useState(0);

  const openUserMenu = async () => {
    if (user) {
      const pets = await getPets(user.usuario);
      setQuantidadePets(pets.length);
    }
    const allUsers = await getAllUsers();
    setUsuarios(allUsers);
    setUserMenuVisible(true);
  };

  const handleInfoUsuario = () => {
    setInfoVisible(true);
    setUserMenuVisible(false);
  };

  const handleAlterarContaModal = () => {
    setAlterarContaVisible(true);
    setUserMenuVisible(false);
  };

  const handleAlterarConta = (u) => {
    setUser(u);
    setAlterarContaVisible(false);
  };

  const handleLogout = () => {
    setUser(null);
    setUserMenuVisible(false);
    setAlterarContaVisible(false);
    Alert.alert('Sucesso', 'Você saiu da conta.');
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#ff7a00' },
            headerTintColor: '#fff',
            tabBarActiveTintColor: '#ff7a00',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: { backgroundColor: '#e6f0ff' },
            headerRight: () =>
              user && (
                <TouchableOpacity style={{ marginRight: 16 }} onPress={openUserMenu}>
                  <MaterialIcons name="account-circle" size={28} color="#fff" />
                </TouchableOpacity>
              ),
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = 'home';
              else if (route.name === 'Cadastrar Pet') iconName = 'add-circle-outline';
              else if (route.name === 'Pets Cadastrados') iconName = 'pets';
              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Cadastrar Pet" component={RegisterPetScreen} />
          <Tab.Screen name="Pets Cadastrados" component={PetsScreen} />
        </Tab.Navigator>
      </NavigationContainer>

      {/* Modal do menu de usuário */}
      <Modal
        transparent
        visible={userMenuVisible}
        animationType="fade"
        onRequestClose={() => setUserMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Menu do Usuário</Text>

            {/* Informações do usuário */}
            <TouchableOpacity style={styles.modalButton} onPress={handleInfoUsuario}>
              <MaterialIcons name="settings" size={18} color="#075985" style={{ marginRight: 8 }} />
              <Text style={styles.modalText}>Informações do usuário</Text>
            </TouchableOpacity>

            {/* Alterar conta */}
            <TouchableOpacity style={styles.modalButton} onPress={handleAlterarContaModal}>
              <MaterialIcons name="account-circle" size={18} color="#075985" style={{ marginRight: 8 }} />
              <Text style={styles.modalText}>Alterar conta</Text>
            </TouchableOpacity>

            {/* Sair */}
            <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
              <MaterialIcons name="exit-to-app" size={18} color="red" style={{ marginRight: 8 }} />
              <Text style={[styles.modalText, { color: 'red' }]}>Sair</Text>
            </TouchableOpacity>

            {/* Cancelar */}
            <TouchableOpacity style={[styles.modalButton, { marginTop: 8 }]} onPress={() => setUserMenuVisible(false)}>
              <Text style={styles.modalText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de alterar conta */}
      <Modal
        transparent
        visible={alterarContaVisible}
        animationType="fade"
        onRequestClose={() => setAlterarContaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Alterar Conta</Text>

            {usuarios.map((u) => (
              <TouchableOpacity key={u.usuario} style={styles.modalButton} onPress={() => handleAlterarConta(u)}>
                <MaterialIcons name="account-circle" size={18} color="#075985" style={{ marginRight: 8 }} />
                <Text style={styles.modalText}>{u.usuario}</Text>
              </TouchableOpacity>
            ))}

            {/* Cancelar */}
            <TouchableOpacity style={[styles.modalButton, { marginTop: 8 }]} onPress={() => setAlterarContaVisible(false)}>
              <Text style={styles.modalText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de informações detalhadas do usuário */}
      <Modal
        transparent
        visible={infoVisible}
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Informações do Usuário</Text>

            <Text style={styles.infoText}>Nome completo: {user?.nomeCompleto || 'Desconhecido'}</Text>
            <Text style={styles.infoText}>Nome do usuário: {user?.usuario}</Text>
            <Text style={styles.infoText}>E-mail: {user?.email}</Text>
            <Text style={styles.infoText}>Quantidade de pets: {quantidadePets}</Text>
            <Text style={styles.infoText}>
              Conta criada em: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Desconhecido'}
            </Text>

            <TouchableOpacity style={[styles.modalButton, { marginTop: 12 }]} onPress={() => setInfoVisible(false)}>
              <Text style={styles.modalText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#075985',
  },
});
