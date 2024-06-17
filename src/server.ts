import path from "path";
import http from "http";
import express from "express";
import socketio from "socket.io";
import { formatMessage } from "./utils/messages";
import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} from "./utils/users";

const PORT: number | string = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

// Set static folder
app.use(express.static(path.join(__dirname, "../public")));

// Run when client connects
io.on("connection", (socket: socketio.Socket) => {
  socket.on(
    "joinRoom",
    ({ username, room }: { username: string; room: string }) => {
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);

      // Welcome current user
      socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user.username} has joined the chat`)
        );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  );

  // Listen for chatMessage
  socket.on("chatMessage", (msg: string) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    }
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => {});

export default app;
