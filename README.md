# ✈️ MoveTrip

Aplicativo mobile de planejamento de viagens desenvolvido em **React Native** com **Expo Go**, que permite explorar destinos ao redor do mundo, criar roteiros personalizados e organizar todas as viagens em um só lugar.

Projeto Prático Integrador desenvolvido para a disciplina de Programação de Banco de Dados / Desenvolvimento Mobile.

---

## 📱 O que o app faz

O MoveTrip permite que o usuário:

- Explore países e destinos com fotos, bandeira, idioma e nome em português
- Busque países por nome em tempo real
- Crie roteiros de viagem personalizados, com nome, cidade, datas, orçamento, fotos e status
- Organize seus roteiros por status: **Desejo**, **Planejado** e **Visitado**
- Edite e exclua roteiros já criados
- Favorite roteiros (toque no adicionar à lista)
- Acompanhe estatísticas de países visitados e desejados
- Adicione cidades e locais visitados dentro de cada roteiro

---

## 🌐 API utilizada

O app consome a **[API de Países do IBGE](https://servicodados.ibge.gov.br/api/docs/paises)** (Instituto Brasileiro de Geografia e Estatística), uma API pública, oficial e gratuita que não exige chave de acesso (API key) e retorna os dados já em português.

**Endpoint utilizado:**
```
GET https://servicodados.ibge.gov.br/api/v1/paises
```

**Dados consumidos da API:**
- Nome do país (em português)
- Capital
- Região
- Moeda
- Idioma

A bandeira de cada país é gerada a partir do código ISO (ex: `br`, `fr`, `jp`) usando o serviço público **[FlagCDN](https://flagcdn.com/)**, também gratuito e sem necessidade de chave.

Caso a API esteja fora do ar ou instável, o app possui um sistema de **fallback** com uma lista local de países, para que a navegação não quebre.

---

## 🔥 Banco de dados

Os roteiros criados pelo usuário são salvos no **Firebase Firestore** (banco de dados NoSQL em nuvem do Google), com CRUD completo:

| Operação | Onde acontece | O que faz |
|---|---|---|
| **Create** | `NewTripScreen.js` | Cria um novo roteiro de viagem |
| **Read** | `MyListScreen.js` / `TripDetailsScreen.js` | Lista os roteiros e exibe detalhes |
| **Update** | `EditTripScreen.js` | Edita status, nota, data e orçamento |
| **Delete** | `MyListScreen.js` | Remove um roteiro (com confirmação) |

---

## 🛠️ Tecnologias utilizadas

- [React Native](https://reactnative.dev/) + [Expo Go](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/) (Tab Navigation + Stack Navigation)
- [Firebase Firestore](https://firebase.google.com/products/firestore)
- [API de Países do IBGE](https://servicodados.ibge.gov.br/api/docs/paises) — dados dos países em português
- [FlagCDN](https://flagcdn.com/) — bandeiras dos países
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) — seleção de fotos da galeria
- [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) — seletor de datas
- [@expo/vector-icons](https://icons.expo.fyi/) — ícones (Ionicons)

---

## 📂 Estrutura do projeto

```
MoveTrip/
├── assets/                  # Imagens, logo e ícones do app
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js  # Configuração de rotas (Tab + Stack)
│   ├── screens/              # Todas as telas do app
│   │   ├── ExploreScreen.js
│   │   ├── CountryDetailScreen.js
│   │   ├── MyListScreen.js
│   │   ├── NewTripScreen.js
│   │   ├── EditTripScreen.js
│   │   ├── TripDetailsScreen.js
│   │   ├── AddCityScreen.js
│   │   ├── CityDetailsScreen.js
│   │   └── AddPlaceScreen.js
│   └── services/
│       ├── countriesApi.js   # Consumo da API de Países do IBGE
│       └── firebaseConfig.js # Configuração do Firebase
├── App.js                    # Componente raiz do app
└── package.json
```

---

## 🔑 Firebase

O projeto vem com a configuração do Firebase em `src/services/firebaseConfig.js`.

---

## 👩‍💻 Autores

Desenvolvido por Renata Santana Lopes e Pedro Gabriel Gomes de Moraes Oliveira.
