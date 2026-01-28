# 🎫 Sistema de Tickets LAN

Sistema de atendimento em tempo real para redes locais, desenvolvido com React, Node.js e Socket.io.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Sobre o Projeto

Sistema de chat para atendimento ao cliente com funcionalidades de:
- ✨ Seleção de perfil (Usuário ou Administrador)
- 💬 Chat em tempo real entre usuário e admin
- ⭐ Sistema de avaliação com 1 a 5 estrelas
- 🔔 Notificação sonora quando novo ticket chega
- 🌐 Funciona em rede local (LAN)

## 🚀 Tecnologias

- **Frontend:** React 18, Vite, Socket.io-client
- **Backend:** Node.js, Express, Socket.io
- **Estilo:** CSS3 com gradientes e animações

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:
- [Node.js](https://nodejs.org/) (v14 ou superior)
- npm (vem junto com Node.js)

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd ticktes
```

2. **Instale as dependências do Backend:**
```bash
cd backend
npm install
```

3. **Instale as dependências do Frontend:**
```bash
cd ../frontend
npm install
```

## ▶️ Como Rodar

### Localmente (mesmo computador)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse no navegador: **http://localhost:3000**

---

### 🌐 Em Rede Local (LAN)

Para permitir que outros computadores na mesma rede acessem:

#### 1. Descubra seu IP local:
```bash
# Windows (PowerShell)
ipconfig

# Linux/Mac
ifconfig
```
Procure por **"Endereço IPv4"** (ex: `192.168.1.10`)

#### 2. Configure o Frontend:

Edite `frontend/main.jsx` (linha 6):
```javascript
const socket = io('http://SEU_IP_AQUI:3001');
// Exemplo: const socket = io('http://192.168.1.10:3001');
```

#### 3. Libere as portas no Firewall (Windows):

Execute no PowerShell como **Administrador**:
```powershell
New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
New-NetFirewallRule -DisplayName "Vite Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

#### 4. Inicie os servidores normalmente

#### 5. Acesse de outros computadores:
```
http://SEU_IP:3000
```
Exemplo: `http://192.168.1.10:3000`

---

## 🎮 Como Usar

### Como Usuário:
1. Acesse a aplicação
2. Selecione **"Usuário"**
3. Clique em **"Solicitar Atendimento"**
4. Aguarde de 10 a 60 segundos para ser atendido
5. Converse no chat com o administrador

### Como Administrador:
1. Acesse a aplicação
2. Selecione **"Administrador"**
3. Você verá todos os tickets ativos
4. Um **som tocará** quando novos tickets chegarem
5. Responda no chat de cada ticket
6. Avalie o atendimento com **1 a 5 estrelas** e finalize

---

## 📁 Estrutura do Projeto

```
ticktes/
├── backend/
│   ├── server.js          # Servidor Express + Socket.io
│   └── package.json
├── frontend/
│   ├── index.html         # HTML principal
│   ├── main.jsx           # Componente React principal
│   ├── style.css          # Estilos
│   ├── vite.config.js     # Configuração do Vite
│   └── package.json
└── README.md
```

---

## 🔒 Segurança

- O sistema funciona apenas em **rede local**
- As portas abertas no firewall só aceitam conexões locais
- Para remover as regras do firewall depois:
```powershell
Remove-NetFirewallRule -DisplayName "Node Backend"
Remove-NetFirewallRule -DisplayName "Vite Frontend"
```

---

## 🐛 Solução de Problemas

### Porta em uso:
Se aparecer erro `EADDRINUSE`, mate os processos Node.js:
```powershell
# Windows
Get-Process -Name node | Stop-Process -Force

# Linux/Mac
killall node
```

### Firewall bloqueando:
Certifique-se de ter executado os comandos de liberação de porta como administrador.

### IP mudou:
Se seu IP local mudar, atualize o arquivo `frontend/main.jsx` com o novo IP.

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Desenvolvido com

- ☕ Café
- 💜 Muito código
- 🎵 Boa música

---

**Dica:** Para uso em produção na internet, considere adicionar autenticação, HTTPS e outras medidas de segurança! 🔐
