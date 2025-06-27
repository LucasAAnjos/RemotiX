# RemotiX

## 📱 Descrição

**RemotiX** é um aplicativo de manutenção de equipamentos com funcionalidades para:
- Gerenciar áreas, setores e equipamentos.
- Simular e controlar motores.
- Registrar manutenções.
- Escanear QR Codes.
- Autenticar usuários.
- Integrar com Firebase.

---

## 📁 Estrutura de Pastas

```
RemotiX-MaintenanceDev/
│
├── App.js                 # Ponto de entrada da aplicação
├── index.js               # Registro do app
├── app.json               # Configuração do app (Expo)
├── eas.json               # Configuração do EAS Build (Expo)
├── metro.config.js        # Configuração do bundler Metro
├── package.json           # Dependências e scripts do projeto
├── package-lock.json      # Lockfile do npm
│
├── android/               # Projeto nativo Android
│   ├── build.gradle
│   ├── gradlew
│   ├── settings.gradle
│   ├── gradle/
│   └── app/
│       ├── build.gradle
│       ├── proguard-rules.pro
│       └── src/
│           ├── main/
│           │   ├── AndroidManifest.xml
│           │   ├── java/com/lucasaanjos/remotix/
│           │   │   ├── MainActivity.kt
│           │   │   └── MainApplication.kt
│           │   ├── res/
│           │   │   ├── drawable/
│           │   │   ├── mipmap-*/ (ícones)
│           │   │   ├── values/ (strings, temas)
│           │   │   └── ...
│           └── ...
│
├── Areas/                 # Telas e lógica de áreas/setores
├── AreaDetails/           # Cadastro e detalhes de equipamentos por área
├── Equipament/            # Funcionalidades de equipamentos
├── Drivers/               # Drivers de simulação e controle de motores
├── Login/                 # Autenticação e formulário de login
├── Models/                # Modelos de dados
├── Utils/                 # Funções utilitárias
├── ValidaçõesTeste/       # Scripts de teste e validações de entrada
├── services/              # Integração com Firebase/Firestore
├── src/storage/           # Armazenamento local
├── nodejs-assets/         # Backend Node.js embarcado
└── assets/                # Ícones e imagens
```

---

## ⚙️ Tecnologias

- React Native
- Node.js (local)
- Firebase (Auth + Firestore)
- Android nativo

---

## 🚀 Instalação

**Pré-requisitos:** Node.js 14+, npm ou yarn, Expo CLI ou React Native CLI, Android Studio.

```bash
git clone https://github.com/SEU_USUARIO/RemotiX.git
cd RemotiX-MaintenanceDev
npm install
```

Configure o Firebase em `services/firebaseConfig.js`:

```js
export const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

Para rodar:

```bash
npx react-native run-android
# ou
npx expo start
```

Para build Android:

```bash
cd android
./gradlew assembleRelease
```

---

## ✅ Scripts Principais

- **App.js** — Entrada da aplicação.
- **index.js** — Registro do app.
- **metro.config.js** — Configuração do bundler Metro.
- **eas.json** — Configuração Expo EAS.
- **nodejs-assets/nodejs-project/** — Scripts Node.js embarcados.

---

## 🔒 Variáveis Sensíveis

Adicione `.env` para chaves de API — **não publique credenciais**.

---

## 🧪 Testes

Ainda não há testes automatizados. Recomenda-se Jest + React Native Testing Library.

---


## 🤝 Contribuindo


---
