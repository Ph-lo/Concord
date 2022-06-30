const uuidv4 = require('uuid').v4;

const messages = new Set();
const users = new Map();


class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on('join_channel', () => this.joinChannel(chan));
    socket.on('getMessages', () => this.getMessages());
    socket.on('message', (value) => this.handleMessage(value));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`error: ${err.message}`);
    });
  }
  
  joinChannel(chan) {
    this.sockets.join(chan);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  }

  sendMessage(message) {
    this.io.sockets.emit('chat message', message);
  }
  
  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  handleMessage(body) {
    const message = {
      id: uuidv4(),
      user: body.username,
      value: body.value,
      time: Date.now()
    };
    // console.log(message);
    messages.add(message);
    this.sendMessage(message);

  }

  disconnect() {
    users.delete(this.socket);
  }
}

function chat(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);   
  });
};

module.exports = chat;