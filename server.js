const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {

    socket.join(roomId);

    socket.roomId = roomId;     // ✅ จำห้องไว้
    socket.username = username; // จำชื่อไว้

    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      name: username
    });
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", {
      from: socket.id,
      name: socket.username,
      data
    });
  });

  socket.on("disconnect", () => {

    console.log("Disconnected:", socket.id);

    if (socket.roomId) {
      socket.to(socket.roomId).emit("user-left", socket.id);
    }

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});