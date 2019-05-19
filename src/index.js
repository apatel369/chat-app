const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  console.log("New WebSocket connection");

  socket.on('join', (options, callback) => {
    const { error, user } = addUser( { id: socket.id, ...options }) 

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit("message", generateMessage("Welcome"));
    socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`));

    callback()

  })

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to('tu raji tha').emit("message", generateMessage(message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id)
  
    if (user) {
      io.to(user[0].room).emit('message', generateMessage(`${user[0].username} has left`))
    }

  });
});

server.listen(port, () => {
  console.log(`Server up on port ${port}`);
});
