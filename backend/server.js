
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let tickets = [];
let waitingUsers = [];

io.on('connection', (socket) => {
  socket.on('requestTicket', () => {
    waitingUsers.push(socket.id);
    setTimeout(() => {
      if (waitingUsers.includes(socket.id)) {
        const ticket = { id: Date.now(), user: socket.id, messages: [] };
        tickets.push(ticket);
        socket.emit('ticketAssigned', ticket.id);
        waitingUsers = waitingUsers.filter(id => id !== socket.id);
        io.emit('newTicket', ticket);
      }
    }, Math.floor(Math.random() * 50000) + 10000);
  });

  socket.on('sendMessage', ({ ticketId, message, sender }) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.messages.push({ text: message, sender: sender || 'user', timestamp: new Date().toLocaleTimeString() });
      io.emit('updateTicket', ticket);
    }
  });

  socket.on('rateTicket', ({ ticketId, rating, note }) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.rating = rating;
      ticket.note = note;
      io.emit('updateTicket', ticket);
    }
  });
});

server.listen(3001, () => console.log('Backend rodando na porta 3001'));
