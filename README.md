<p align="center">
  <img src="https://github.com/Ph-lo/Concord/blob/main/frontend/src/Logo-irc.png" />
</p>
<div>
  <h1 align="center">Concord</h1>
  <p align="center">Simple IRC</p>
</div>

## Table of Contents

* [General info](#general-info)
* [Setup](#setup)
* [Commands](#commands)
* [Status](#status)


## General info
Concord, a text-based chat system for instant messaging, done using React and Socket.io

<p align="center">
  <img width="900px" src="https://github.com/Ph-lo/Concord/blob/main/frontend/readme-pictures.png" />
</p>


## Setup
Install Dependencies for the front and the backend with npm

``` shell
npm install
```
On two separate terminals, start both front and backend with npm
``` shell
npm start
```
## Commands
<h5>The IRC has in-chat commands, that work like this:</h5>

Modify the username
```in-chat
/nick <nickname>
```

List available channels on the server, optional parameter [string] to search a specific channel
```in-chat
/list <string>
```

Create a channel
```in-chat
/create <channel>
```

Delete a channel
```in-chat
/delete <channel>
```

Join a channel
```in-chat
/join <channel>
```

Leave a channel
```in-chat
/leave <channel>
```

List the users connected to the channel
```in-chat
/users
```
<h5>Users can also use some basic BBcode commands:</h5>

```in-chat
[b]bold text[/b]

[i]italic text[/i]

[u]underlined text[/u]

[s]striked text[/s]

[color=<color name or HEX value>]colored text[/color]

[link=<link here>]link text[/link]

[code]code here[/code]

[img]image url here[/img]

[video]video url here[/video]
```

## Status
Users can : 
* set and modify their username
* join, leave, create and delete channels
* send messages in different channels and in one-on-one chat
* use in-chat commands
