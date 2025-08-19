/* const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.broadcast.emit('chat message', 'A user has joined the chat'); // Notify others

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    socket.broadcast.emit('chat message', 'A user has left the chat'); // Notify others
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

const users = {}; // Store users and their nicknames

io.on('connection', (socket) => {
  socket.on('set nickname', (nickname) => {
    users[socket.id] = nickname; // Save nickname
    socket.broadcast.emit('chat message', `${nickname} has joined the chat`);
    io.emit('update users', Object.values(users)); // Update online users
  });

  socket.on('disconnect', () => {
    const nickname = users[socket.id];
    delete users[socket.id]; // Remove user
    socket.broadcast.emit('chat message', `${nickname} has left the chat`);
    io.emit('update users', Object.values(users)); // Update online users
  });

  socket.on('chat message', (msg) => {
    const nickname = users[socket.id] || 'Anonymous';
    socket.broadcast.emit('chat message', `${nickname}: ${msg}`); // Send to others
    socket.emit('chat message', `You: ${msg}`); // Send to sender
  });
});
server.listen(3000, () => {
  console.log('listening on *:3000');
}); */



const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const users = {}; // Store users and their nicknames

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle nickname setup
  socket.on('set nickname', (nickname) => {
    users[socket.id] = nickname;
    socket.broadcast.emit('chat message', `${nickname} has joined the chat`);
    io.emit('update users', Object.values(users)); // Update online users
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const nickname = users[socket.id];
    delete users[socket.id];
    socket.broadcast.emit('chat message', `${nickname} has left the chat`);
    io.emit('update users', Object.values(users)); // Update online users
  });

  // Handle chat messages
  socket.on('chat message', (msg) => {
    const nickname = users[socket.id] || 'Anonymous';
    socket.broadcast.emit('chat message', `${nickname}: ${msg}`); // Send to others
  });

  // Handle typing indicator
  socket.on('typing', () => {
    const nickname = users[socket.id] || 'Anonymous';
    socket.broadcast.emit('typing', `${nickname} is typing...`);
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing');
  });

  // Handle private messages
  socket.on('private message', ({ to, message }) => {
    const recipientSocket = Object.keys(users).find((id) => users[id] === to);
    if (recipientSocket) {
      io.to(recipientSocket).emit('private message', {
        from: users[socket.id],
        message,
      });
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});