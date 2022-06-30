const express = require("express");
const chat = require("./messages");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");
const e = require("express");
// const io = socket(server);

app.use(cors());

let users = [];
let connectedUsers = {
  general: [],
  random: [],
};
const messages = {
  general: [],
  random: [],
};

function addMessageToChannels(message) {
  const entries = Object.entries(messages);
    entries.forEach((item) => {
      // console.log(item[1])
      if (item[1]) {
        item[1].push({
          sender: "",
          content: message,
        });
      }
    });
    const newMessages = entries.reduce((accum, [k, v]) => {
      accum[k] = v;
      return accum;
    }, {});
    // console.log('ok')
    // return newMessages;
}

io.on("connection", (socket) => {
  socket.on("join server", (username) => {
    const user = {
      username,
      id: socket.id,
      channels: [],
    };
    users.push(user);
    // console.log(users)
    io.emit("new user", users);
    io.emit("rooms", messages);
  });

  socket.on("join room", (room, cb) => {
    socket.join(room);
    cb(messages[room]);
  });

  socket.on("create", ({ content, name, username }) => {
    messages[name] = [];
    connectedUsers[name] = [];
    const payload = {
      content: content,
      chatName: name,
      sender: username,
    };
    addMessageToChannels(username + " created the channel " + name);
    // console.log(newMessages);
    socket.to(messages[name]).emit("new message", payload);
    io.emit("rooms", messages);
    io.emit("creation channel", username + " created the channel " + name);
  });

  socket.on('delete channel', (name) => {
    // console.log('1')
    delete messages[name];
    addMessageToChannels('The channel "' + name + '" has been deleted');
    io.emit("rooms", messages);
  });

  socket.on('new username', (username) => {
    // console.log(username);
    // console.log(Object.values(users));
    let tmp;
    Object.values(users).map(user => {
      // console.log(user);
      if (user.id === socket.id) {
        tmp = user.username;
        user.username = username;
      }
    });
    addMessageToChannels(tmp + " changed username to: " + username);
    // console.log(messages)
    io.emit("new user", users);
    io.emit("rooms", messages);
  });

  socket.on('join new channel', ({ temp, username }) => {
    // console.log(temp + ' ' + username);
    messages[temp].push({ sender: "", content: username + " joined the channel"});
    // connectedUsers[temp].push(username);
    let res = users.filter(user => {
      return user.username === username
    });
    res[0].channels.push(temp);
    // console.log(res[0].channels)
    // console.log(connectedUsers)
    io.emit('joined channel', messages);
    io.emit('new user', users);
  });

  socket.on("send message", ({ content, to, sender, chatName, isChannel }) => {
    if (isChannel) {
      const payload = {
        content,
        chatName,
        sender,
      };
      // console.log(payload)
      socket.to(to).emit("new message", payload);
    } else if (chatName == "new") {
      // console.log('ok')
    } else {
      // console.log('no')
      const payload = {
        content,
        chatName: sender,
        sender,
      };
      socket.to(to).emit("new message", payload);
    }
    // console.log(messages)
    if (messages[chatName]) {
      messages[chatName].push({
        sender,
        content,
      });
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.id !== socket.id);
    // console.log('disconnected')
    io.emit("new user", users);
  });
});

server.listen(3042, () => {
  console.log("listening on :3042");
});
