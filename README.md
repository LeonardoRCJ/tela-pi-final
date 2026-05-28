# Tela PI Final

Aplicativo mobile desenvolvido com React Native e Expo para gerenciamento de turmas, frequência de alunos, álbuns de fotos e sessões de treinamento. O app oferece autenticação segura, integração com câmera para scanner de QR codes e interface moderna com tema claro/escuro.

## 📱 Funcionalidades

- **Autenticação**: Sistema de login e cadastro com JWT
- **Gerenciamento de Turmas**: Visualizar e gerenciar turmas de alunos
- **Controle de Frequência**: Marcar presença de alunos em aulas
- **Álbuns**: Gerenciar e visualizar álbuns de fotos
- **Scanner QR**: Leitura de QR codes para integração com turmas
- **Perfil de Usuário**: Editar informações pessoais
- **Temas**: Suporte a modo claro e escuro
- **Navegação por Abas**: Interface intuitiva com navegação inferior

## 🛠️ Tecnologias

- **React Native** (0.81.5)
- **Expo** (54.0.33)
- **React Navigation** (tabs e stack navigation)
- **TypeScript** (5.9.2)
- **TailwindCSS** (via NativeWind)
- **React Hook Form** + Zod (validação de formulários)
- **Axios** (requisições HTTP)
- **JWT Decode** (autenticação)
- **React Native Reanimated** (animações)
- **Expo Camera** (acesso à câmera)
- **QR Code SVG** (geração/leitura de QR codes)

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── context/          # Contextos (Auth, Theme, App)
├── i18n/             # Internacionalização
├── interfaces/       # Tipos TypeScript
├── screens/          # Telas da aplicação
├── services/         # APIs e serviços
└── zod/              # Schemas de validação

components/           # Componentes UI (design system)
├── ui/               # Componentes base (button, input, etc)
├── sign-in-form.tsx
└── social-connections.tsx

lib/                  # Utilitários
├── theme.ts          # Configuração de temas
└── utils.ts          # Funções auxiliares
```

## 🚀 Como Começar

### Pré-requisitos
- Node.js (18+)
- npm ou yarn
- Expo CLI

### Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd tela-pi-final
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o servidor Expo:
```bash
npm start
```

### Rodando em Diferentes Plataformas

```bash
# iOS (simulador ou dispositivo)
npm run ios

# Android (emulador ou dispositivo)
npm run android

# Web
npm run web
```

## 🔐 Autenticação

O app utiliza JWT para autenticação segura. Os tokens são armazenados em:
- **iOS/Android**: Expo Secure Store
- **Web**: AsyncStorage

O contexto de autenticação (`AuthContext`) gerencia:
- Login e logout de usuários
- Armazenamento seguro de tokens
- Atualização automática de tokens expirados

## 🎨 Tema

O app suporta temas claro e escuro. A configuração de tema está em `src/context/ThemeContext.tsx` e pode ser customizada em `lib/theme.ts`.

## 📡 API

As requisições são feitas através do serviço `api.ts` utilizando Axios. Configure a URL base da API nas variáveis de ambiente.

## 📝 Scripts Disponíveis

```bash
npm start      # Inicia o servidor Expo
npm run ios    # Abre no simulador iOS
npm run android # Abre no emulador Android
npm run web    # Abre na web
```

## 🎯 Principais Telas

| Tela | Descrição |
|------|-----------|
| **Login** | Autenticação do usuário |
| **SignUp** | Cadastro de novos usuários |
| **ClassGroups** | Lista de turmas do usuário |
| **Frequency** | Controle de frequência |
| **Albums** | Galeria de álbuns |
| **QrScanner** | Scanner de QR codes |
| **Profile** | Perfil do usuário |

## 📦 Dependências Principais

- `@react-navigation/*` - Navegação
- `react-hook-form` + `zod` - Formulários e validação
- `axios` - HTTP client
- `nativewind` - Tailwind para React Native
- `expo-camera` - Acesso à câmera
- `react-native-toast-message` - Notificações
- `@rn-primitives/*` - Componentes primitivos acessíveis

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se necessário):
```
EXPO_PUBLIC_API_URL=https://sua-api.com
```

## 📄 Licença

Este projeto está sob a licença 0BSD.

## 👥 Contribuições

Para contribuir com o projeto:
1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para questões sobre Expo: [Documentação Expo](https://docs.expo.dev)
Para questões sobre React Native: [Documentação React Native](https://reactnative.dev)
