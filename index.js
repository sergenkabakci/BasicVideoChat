const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Çalışıyor");
});
io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", {
      signal: signalData,
      from,
      name,
    });
  });
  socket.on("updateMyMedia", ({ type, currentMediaStatus }) => {
    console.log("Update Media");
    socket.broadcast.emit("updateUser", { type, currentMediaStatus });
  });

  socket.on("msgUser", ({ name, to, msg, sender }) => {
    io.to(to).emit("msgRcv", { name, msg, sender });
  });

  socket.on("CallAnswer", (data) => {
    socket.broadcast.emit("updateUser", {
      type: data.type,
      currentMediaStatus: data.myMediaStatus,
    });
    io.to(data.to).emit("callAccepted", data);
  });
  socket.on("endCall", ({ id }) => {
    io.to(id).emit("endCall");
  });
});
server.listen(PORT, () => console.log(`Port ${PORT}`));
