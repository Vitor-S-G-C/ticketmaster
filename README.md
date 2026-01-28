# ticketmaster



Preciso modificar meu projeto para aceitar conexões de rede local. Faça essas 3 mudanças:

1. No arquivo frontend/main.jsx, linha 6, troque:
const socket = io('http://localhost:3001');
Por:
const socket = io('http://192.168.2.6:3001');

2. No arquivo backend/server.js, na última linha, troque:
server.listen(3001, () => console.log('Backend rodando na porta 3001'));
Por:
server.listen(3001, '0.0.0.0', () => console.log('Backend rodando na porta 3001 - Disponível na rede local'));

3. No arquivo frontend/vite.config.js, adicione host: '0.0.0.0' dentro de server:
server: {
  port: 3000,
  host: '0.0.0.0',
}

Depois reinicie os servidores:
Terminal 1: cd backend && npm start
Terminal 2: cd frontend && npm run dev

E acesse: http://192.168.2.6:3000
