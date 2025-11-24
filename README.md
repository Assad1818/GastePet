# GastePet --- Cálculo de Gastos Mensais com Pets

O GastePet é um aplicativo desenvolvido em React Native com Expo
que permite ao usuário cadastrar pets, preencher informações detalhadas
sobre alimentação, saúde e serviços, e então calcular automaticamente os
gastos mensais e anuais desse pet.

O objetivo do projeto é oferecer uma forma clara e intuitiva para que
tutores entendam o custo real de manter um animal de estimação.

## 📌 Funcionalidades Principais

-   Cadastro completo de pets dividido em 4 etapas.
-   Cálculo detalhado de gastos.
-   Resumo final com valores mensais e anuais.
-   Armazenamento local usando AsyncStorage.
-   Navegação entre telas usando React Navigation.

## 📂 Estrutura de Pastas

    GastePet-main
    │
    ├── assets/
    ├── components/
    │   └── CustomButton/
    │       └── CustomButton.js
    ├── context/
    │   └── AuthContext.js
    ├── repository/
    │   └── db.js
    ├── screens/
    │   ├── RegisterPet/
    │   │   ├── Page1.js
    │   │   ├── Page2.js
    │   │   ├── Page3.js
    │   │   ├── Page4.js
    │   ├── HomeScreen.js
    │   ├── PetsScreen.js
    │   ├── RegisterPetScreen.js
    ├── api.js
    ├── App.js
    ├── app.json
    ├── index.js
    ├── package.json
    └── package-lock.json

## ⚙️ Tecnologias Utilizadas

-   React Native 0.81\
-   Expo 54\
-   React Navigation\
-   AsyncStorage\
-   react-native-picker\
-   expo-sqlite

## ▶️ Como Rodar o Projeto

``` sh
npm install
npx expo starT
```

Abra no aplicativo Expo Go.
