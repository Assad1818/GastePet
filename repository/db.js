import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_USERS = 'usuarios';
const KEY_PETS = 'pets';

export const createUser = async (email, usuario, senha, nomeCompleto = '', createdAt = null) => {
  const data = await AsyncStorage.getItem(KEY_USERS);
  const usuarios = data ? JSON.parse(data) : [];

  const existe = usuarios.find(u => u.usuario === usuario || u.email === email);
  if (existe) throw new Error('Usuário ou email já existe');

  const userObj = { email, usuario, senha, nomeCompleto, createdAt: createdAt || new Date().toISOString() };
  usuarios.push(userObj);
  await AsyncStorage.setItem(KEY_USERS, JSON.stringify(usuarios));
  return userObj;
};

export const getUserByCredentials = async (usuario, senha) => {
  const data = await AsyncStorage.getItem(KEY_USERS);
  const usuarios = data ? JSON.parse(data) : [];
  return usuarios.find(u => u.usuario === usuario && u.senha === senha) || null;
};

export const getAllUsers = async () => {
  const data = await AsyncStorage.getItem(KEY_USERS);
  return data ? JSON.parse(data) : [];
};
export const addPet = async (petObj) => {
  const data = await AsyncStorage.getItem(KEY_PETS);
  const pets = data ? JSON.parse(data) : [];
  const newPet = {
    id: Date.now(),
    ...petObj,
    createdAt: new Date().toISOString(),
  };
  pets.push(newPet);
  await AsyncStorage.setItem(KEY_PETS, JSON.stringify(pets));
  return newPet;
};

export const getPets = async (usuario) => {
  const data = await AsyncStorage.getItem(KEY_PETS);
  const pets = data ? JSON.parse(data) : [];
  if (!usuario) return pets; // se usuario não passado, retorna todos
  return pets.filter(p => p.usuario === usuario);
};

export const deletePet = async (id, usuario) => {
  const data = await AsyncStorage.getItem(KEY_PETS);
  const pets = data ? JSON.parse(data) : [];
  const newPets = pets.filter(p => !(p.id === id && (!usuario || p.usuario === usuario)));
  await AsyncStorage.setItem(KEY_PETS, JSON.stringify(newPets));
};

export const getAllPets = async () => {
  const data = await AsyncStorage.getItem(KEY_PETS);
  return data ? JSON.parse(data) : [];
};