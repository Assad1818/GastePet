import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------- USUÁRIOS -------------------
export const createUser = async (email, usuario, senha, nomeCompleto) => {
  const data = await AsyncStorage.getItem('usuarios');
  const usuarios = data ? JSON.parse(data) : [];

  const existe = usuarios.find(u => u.usuario === usuario || u.email === email);
  if (existe) throw new Error('Usuário ou email já existe');

  const newUser = {
    email,
    usuario,
    senha,
    nomeCompleto,
    createdAt: new Date().toISOString() // armazena data de criação
  };

  usuarios.push(newUser);
  await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
};

export const getUserByCredentials = async (usuario, senha) => {
  const data = await AsyncStorage.getItem('usuarios');
  const usuarios = data ? JSON.parse(data) : [];
  return usuarios.find(u => u.usuario === usuario && u.senha === senha) || null;
};

// Retorna todos os usuários
export const getAllUsers = async () => {
  const data = await AsyncStorage.getItem('usuarios');
  const usuarios = data ? JSON.parse(data) : [];
  return usuarios;
};

// ------------------- PETS -------------------
export const addPet = async ({ nome, raca, porte, idade, usuario }) => {
  if (!usuario) throw new Error('Usuário não logado');

  const data = await AsyncStorage.getItem('pets');
  const pets = data ? JSON.parse(data) : [];
  const newPet = { id: Date.now(), nome, raca, porte, idade, usuario };
  pets.push(newPet);
  await AsyncStorage.setItem('pets', JSON.stringify(pets));
  return newPet;
};

export const getPets = async (usuario) => {
  const data = await AsyncStorage.getItem('pets');
  const pets = data ? JSON.parse(data) : [];
  if (!usuario) return [];
  return pets.filter(p => p.usuario === usuario);
};

export const deletePet = async (id, usuario) => {
  const data = await AsyncStorage.getItem('pets');
  const pets = data ? JSON.parse(data) : [];
  const newPets = pets.filter(p => !(p.id === id && p.usuario === usuario));
  await AsyncStorage.setItem('pets', JSON.stringify(newPets));
};

// ------------------- LIMPAR DB -------------------
export const clearDatabase = async () => {
  await AsyncStorage.removeItem('usuarios');
  await AsyncStorage.removeItem('pets');
  await AsyncStorage.removeItem('loggedUser');
};
