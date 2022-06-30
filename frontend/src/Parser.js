function commandParser(
  inputValue,
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
) {
  const commands = {
    "/nick": (username) => {
      if (username !== "" && typeof username !== "undefined") {
        updateUsername(username);
      } else {
        alert('You must enter a nickname with the command "/nick"');
      }
    },
    "/list": (string = null) => {
      let chans = "";
      if (string !== null) {
        const keys = Object.keys(messages);
        keys.map((key) => {
          if (key.includes(string)) {
            chans += key + "\n";
          }
          return chans;
        });
      } else {
        Object.keys(messages).map((channel) => {
          chans += channel + "\n";
          return chans;
        });
      }
      alert(chans);
    },
    "/create": (channelName) => {
      if (channelName !== "" && typeof channelName !== "undefined") {
        createChannel(channelName);
      } else {
        alert(
          'You must enter a name for the channel with the command "/create"'
        );
      }
    },
    "/delete": (channelName) => {
      let authorized = false;
      if (channelName !== "" && typeof channelName !== "undefined") {
        let userChannel;
        messages["general"].map((item) => {
          const chanMatch = "channel " + channelName;
          const regex = new RegExp(chanMatch + "$", "g");
          if (item.content.includes(username) && item.content.match(regex)) {
            authorized = true;
            deleteChannel(channelName);
          }
          return userChannel;
        });
        if (!authorized) {
          alert('Unauthorized action "/delete"');
        }
      } else {
        alert('You must enter a channel name with the command "/delete"');
      }
    },
    "/join": (channelName) => {
      const currentChan = {
        chatName: channelName,
        isChannel: true,
        receiverId: "",
      };
      const chans = Object.keys(messages);
      if (
        chans.includes(channelName) &&
        channelName !== "" &&
        typeof channelName !== "undefined"
      ) {
        toggleChat(currentChan);
        setSelected(channelName);
      } else {
        alert('You must enter a channel name with the command "/join"');
      }
    },
    "/leave": (channelName) => {
      const currentChan = {
        chatName: "general",
        isChannel: true,
        receiverId: "",
      };
      if (channelName !== "" && typeof channelName !== "undefined") {
        const index = connectedRooms.indexOf(channelName);
        const tmp = [...connectedRooms];
        tmp.splice(index, 1);
        setConnectedRooms(tmp);
        toggleChat(currentChan);
        setSelected("general");
      } else {
        alert('You must enter a channel name with the command "/leave"');
      }
    },
    "/users": () => {
      let users = "";
      allUsers.map((user) => {
        if (user.channels.includes(currentChat.chatName)) {
          users += user.username + "\n";
        }
        return users;
      });
      alert(users);
    },
    "/msg": (nickname, message) => {
      if (
        nickname !== "" &&
        typeof nickname !== "undefined" &&
        message !== "" &&
        typeof message !== "undefined"
      ) {
        console.log(nickname + " " + message);
        const currentChan = {
          chatName: nickname,
          isChannel: false,
          receiverId: "",
        };
        toggleChat(currentChan);
        setMessage(message);
        sendMessage();
      } else {
        alert(
          'You must enter a username and a message with the command "/msg"'
        );
      }
    },
  };

  if (inputValue.startsWith("/")) {
    let method;
    let param;

    if (inputValue.trim().indexOf(" ") !== -1) {
      const tmp = inputValue.split(" ");
      const tmpMethod = tmp[0];
      param = tmp[1] !== "" && tmp[1];

      if (commands.hasOwnProperty(tmpMethod)) {
        method = commands[tmpMethod];
        if (tmp.length > 2 && tmpMethod === "/msg") {
          tmp.splice(0, 2);
          const res = tmp.join(" ");
          method(param, res);
        } else {
          method(param);
        }
      }
    } else {
      const tmpMethod = inputValue.match(/^\/\w+/gm);
      if (commands.hasOwnProperty(tmpMethod)) {
        method = commands[tmpMethod];
        method(param);
        return;
      }
    }
  }
}

export default commandParser;