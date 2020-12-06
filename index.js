const express = require("express");
const indexRoutes = require("./routes/index");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Set up Ejs (Template Engine)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.json({ limit: "10kb" })); // Like body-parser, using this middleware to attach req.body property, default in express
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // for using req.body when data was submitted by html-form

//RESTful ROUTE
app.use("/", indexRoutes);
app.use("*", indexRoutes);

// Attach socket instance to req
app.io = io;

io.on("connection", (socket) => {
  console.log(`Socket id ${socket.id} connected !`);
  // when the user disconnects.. perform this
  socket.on("disconnect", () => {
    console.log(`Socket id ${socket.id} disconnected !`);
  });
});

//STARTING SERVER
server.listen(8080, () => {
  console.log(
    "NodeJS for crawling sitemap has started successfully at PORT 8080"
  );
});

module.exports = io;
