import React, { useState, useRef, useEffect } from "react";
import Form from "./components/Login";
import Chat from "./components/Chat";
import io from "socket.io-client";
import immer from "immer";
import commandParser from "./Parser";
import parseBbcode from "./BbCode";

const initialMessagesState = {
  general: [],
  random: [],
};

function App() {
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentChat, setCurrentChat] = useState({
    isChannel: true,
    chatName: "general",
    receiverId: "",
  });
  const [connectedRooms, setConnectedRooms] = useState(["general"]);
  const [allUsers, setAllUsers] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState(initialMessagesState);
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState(initialMessagesState);
  const [selected, setSelected] = useState("general");
  const socketRef = useRef();

  useEffect(() => {
    setMessage("");
  }, [messages]);

  // =========================================================================
  // ============================ CREATE CHANNEL =============================
  // =========================================================================

  function createChannel(e) {
    let channelName;
    if (typeof e !== "object") {
      channelName = e;
    } else {
      e.preventDefault();
      channelName = e.target.name.value;
      e.target.name.value = "";
    }
    initialMessagesState[channelName] = [];

    const payload = {
      content: username + " created the channel " + channelName,
      name: channelName,
      username: username,
    };
    socketRef.current.emit("create", payload);
    const tmp = channelName;
    const newChan = immer(messages, (draft) => {
      draft[tmp] = [];
    });
    setMessages(newChan);
    socketRef.current.on("rooms", async (rooms) => {
      await setChannels(rooms);
      setMessages(rooms);
    });
  }

  // =========================================================================
  // ============================ DELETE CHANNEL =============================
  // =========================================================================
  

  function deleteChannel(e) {
    let channelName;
    if (typeof e !== "object") {
      channelName = e;
    } else {
      e.preventDefault();
      channelName = e.target.previousSibling.data;
    }
    socketRef.current.emit("delete channel", channelName);
    socketRef.current.on("rooms", (rooms) => {
      setMessages(rooms);
    });
    if (currentChat.chatName === channelName) {
      setCurrentChat({
        isChannel: true,
        chatName: "general",
        receiverId: "",
      });
      setSelected("general");
    }
  }

  // =========================================================================
  // =============================== MESSAGES ================================
  // =========================================================================
  
  function handleMessageChange(e) {
    setMessage(e.target.value);
  }
  function sendMessage() {
    if (message.startsWith("/")) {
      commandParser(
        message,
        updateUsername,
        messages,
        createChannel,
        deleteChannel,
        username,
        toggleChat,
        setSelected,
        allUsers,
        setMessage,
        sendMessage,
        connectedRooms,
        setConnectedRooms,
        currentChat
      );
      return;
    }
    // console.log(parseBbcode(message));
    const parsed = parseBbcode(message);
    console.log(parsed)
    const payload = {
      content: parsed,
      to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
      sender: username,
      chatName: currentChat.chatName,
      isChannel: currentChat.isChannel,
    };
    socketRef.current.emit("send message", payload);
    const newMessages = immer(messages, (draft) => {
      draft[currentChat.chatName].push({
        sender: username,
        content: parsed,
      });
    });
    setMessages(newMessages);
  }

  // =========================================================================
  // =============================== JOIN ROOM ===============================
  // =========================================================================
  
  function roomJoinCallback(incomingMessages, room) {
    const newMessages = immer(messages, (draft) => {
      draft[room] = incomingMessages;
    });
    setMessages(newMessages);
  }

  function joinRoom(room) {
    const newConnectedRooms = immer(connectedRooms, (draft) => {
      draft.push(room);
    });
    socketRef.current.emit("join room", room, (messages) =>
      roomJoinCallback(messages, room)
    );
    setConnectedRooms(newConnectedRooms);
    const temp = currentChat.chatName;
    socketRef.current.emit("join new channel", { temp, username });
    socketRef.current.on("joined channel", (rooms) => {
      setMessages(rooms);
    });
    socketRef.current.on("new user", (allUsers) => {
      setAllUsers(allUsers);
    });
  }

  function toggleChat(currentChat) {
    if (!messages[currentChat.chatName]) {
      const newMessages = immer(messages, (draft) => {
        draft[currentChat.chatName] = [];
      });
      setMessages(newMessages);
    }
    setCurrentChat(currentChat);
  }

  // =========================================================================
  // ============================ MODIFY USERNAME ============================
  // =========================================================================
  

  function handleChange(e) {
    setUsername(e.target.value);
  }

  function updateUsername(e) {
    let newUsername;
    if (typeof e !== "object") {
      newUsername = e;
    } else {
      e.preventDefault();
      newUsername = e.target.username.value;
      e.target.username.value = "";
    }
    if (newUsername !== "") {
      setUsername(newUsername);
      socketRef.current.emit("new username", newUsername);
    }
    socketRef.current.on("new user", (allUsers) => {
      setAllUsers(allUsers);
      console.log(allUsers);
    });
    socketRef.current.on("rooms", (rooms) => {
      setMessages(rooms);
    });
  }

  // =========================================================================
  // ============================== CONNECTION ===============================
  // =========================================================================

  function connect() {
    setConnected(true);
    socketRef.current = io.connect("http://localhost:3042");
    socketRef.current.emit("join server", username);
    socketRef.current.emit("join room", "general", (messages) =>
      roomJoinCallback(messages, "general")
    );
    socketRef.current.on("rooms", (rooms) => {
      setChannels(rooms);
      setMessages(rooms);
    });

    const temp = "general";
    socketRef.current.emit("join new channel", { temp, username });
    socketRef.current.on("joined channel", (rooms) => {
      setMessages(rooms);
    });
    socketRef.current.on("new user", (allUsers) => {
      setAllUsers(allUsers);
    });
    socketRef.current.on("connected users", (connectedUsers) => {
      setConnectedUsers(connectedUsers);
      console.log(connectedUsers);
    });

    socketRef.current.on("new message", ({ content, sender, chatName }) => {
      setMessages((messages) => {
        const newMessages = immer(messages, (draft) => {
          if (draft[chatName]) {
            draft[chatName].push({ content, sender });
          } else {
            draft[chatName] = [{ content, sender }];
          }
        });

        return newMessages;
      });
    });
  }

  let body;
  if (connected) {
    body = (
      <Chat
        message={message}
        setMessage={setMessage}
        handleMessageChange={handleMessageChange}
        sendMessage={sendMessage}
        yourId={socketRef.current ? socketRef.current.id : ""}
        allUsers={allUsers}
        joinRoom={joinRoom}
        connectedRooms={connectedRooms}
        currentChat={currentChat}
        toggleChat={toggleChat}
        messages={messages[currentChat.chatName]}
        createChannel={createChannel}
        deleteChannel={deleteChannel}
        channels={channels}
        selected={selected}
        setSelected={setSelected}
        updateUsername={updateUsername}
        username={username}
        connectedUsers={connectedUsers}
      />
    );
  } else {
    body = (
      <Form username={username} onChange={handleChange} connect={connect} />
    );
  }
  return <div className="App">{body}</div>;
}

export default App;
