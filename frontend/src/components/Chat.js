import React, { useRef, useEffect } from "react";
import "../styles/Chat.css";
const parse = require('html-react-parser');

const rooms = ["general", "random"];

function Chat(props) {
  // console.log(props)
  const channels = Object.keys(props.channels);
  // console.log(channels);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [props.messages]);

  function handleSelected(e, currentChat) {
    e.preventDefault();
    if (e.target.tagName !== "BUTTON") {
      const tmp = e.target.innerHTML.replace('<button class="deleteButton">✖</button>', "");
      // console.log(tmp);
      props.setSelected(tmp);
      props.toggleChat(currentChat);
    } else {
      props.deleteChannel(e);
    }
  }

  function newChannel(e) {
    //   console.log(rooms)
    e.preventDefault();
    if (!channels.includes(e.target.name.value)) {
      rooms.push(e.target.name.value);
      // console.log(rooms)
      props.createChannel(e);
    }
    e.target.name.value = "";
  }

  // function deleteChannel(e) {
  //   e.preventDefault();
  //   console.log(e.target.previousSibling.data);
  // }

  function renderRooms(room) {
    //   console.log(room)
    let userChannel;
    const currentChat = {
      chatName: room,
      isChannel: true,
      receiverId: "",
    };
    // console.log(props.channels)
    // if (props.messages) {
    //   console.log(props.messages)
    // }
    props.messages.map((item) => {
      // console.log(item);
      const chanMatch = "channel " + room;
      const regex = new RegExp(chanMatch + "$", "g");
      if (item.content.includes(props.username) && item.content.match(regex)) {
        // console.log(item);
        userChannel = room;
      }
      return userChannel;
    });

    return (
      <div
        className={room === props.selected ? "row selected" : "row"}
        onClick={(e) => {
          handleSelected(e, currentChat);
        }}
        key={room}
      >
        {room}
        {userChannel && userChannel === room && (
          <button className="deleteButton">✖</button>
        )}
      </div>
    );
  }

  function renderUser(user) {
    if (user.id === props.yourId) {
      return (
        <div className="rowCurrentUser" key={user.id}>
          {channels.includes(props.currentChat.chatName) ? (
            <form className="newUsernameForm" onSubmit={props.updateUsername}>
              You :{" "}
              <input
                type="text"
                name="username"
                className="usernameInput"
                placeholder={user.username}
              />
            </form>
          ) : (
            <div>You : {user.username}</div>
          )}
        </div>
      );
    } else if (user.channels.includes(props.currentChat.chatName)) {
      const currentChat = {
        chatName: user.username,
        isChannel: false,
        receiverId: user.id,
      };
      return (
        <div
          className={
            user.username === props.selected ? "rowUser selected" : "rowUser"
          }
          onClick={(e) => {
            props.setSelected(e.target.innerHTML);
            props.toggleChat(currentChat);
          }}
          key={user.id}
        >
          {user.username}
        </div>
      );
    }
  }

  function renderMessages(message, index) {
    return (
      <div className={message.sender === "" ? "adminMessageDiv" : message.sender === props.username ? "userMessageDiv" : "messageDiv"} key={index}>
        <h3>{message.sender}</h3>
        <p className={message.sender === "" ? "adminMessage" : "allMessages"}><>{parse(message.content)}</></p>
      </div>
    );
  }

  let body;
  if (
    !props.currentChat.isChannel ||
    props.connectedRooms.includes(props.currentChat.chatName)
  ) {
    body = <div className="messages">{props.messages.map(renderMessages)}</div>;
  } else {
    body = (
      <div className="joinDiv">
        <button
          className="joinButton"
          onClick={() => props.joinRoom(props.currentChat.chatName)}
        >
          Join {props.currentChat.chatName}
        </button>
      </div>
    );
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      // console.log(e.target)
      // e.target.html = "";
      props.setMessage("");
      props.sendMessage();
    }
  }

  return (
    <div className="container">
      <div className="sideBar">
        <h3>Channels</h3>
        <div className="sideBars">{channels.map(renderRooms)}</div>
        <form className="newChannelDiv" onSubmit={newChannel}>
          <div className="newChanButtons">
            <input
              name="name"
              className="newChannelInput"
              placeholder="Create a channel..."
            />
            <button className="newChannelButton">➕</button>
          </div>
        </form>
      </div>
      <div className="chatPanel">
        <div className="channelInfo">
          <h3>&#35; {props.currentChat.chatName}</h3>
        </div>
        <div className="bodyContainer">
          {body}
          <div ref={messagesEndRef}></div>
        </div>
        <input
          className="textBox"
          value={props.message}
          onChange={props.handleMessageChange}
          onKeyPress={handleKeyPress}
          placeholder="Write here..."
        />
      </div>
      <div className="sideBarRight">
        <h3>Users</h3>
        <div className="sideBars">{props.allUsers.map(renderUser)}</div>
      </div>
    </div>
  );
}

export default Chat;
