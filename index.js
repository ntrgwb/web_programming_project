const MongoStore = require("connect-mongo");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// chat.io
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./model/message.model");

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("sendMessage", async (data) => {
    const message = new Message({
      role: data.role,
      content: data.content
    });

    await message.save();
    io.emit("receiveMessage", message);
  });
});

require("dotenv").config();

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));

<<<<<<< HEAD
=======
app.use(bodyParser.json());

>>>>>>> a5e22e4453d99b860fe4867008d24ab552a3a4b4
const systemConfig = require("./config/system");
const database = require("./config/database");

const port = process.env.PORT || 3000;

database.connect();

const routeAdmin = require("./routes/admin/index_route");
const route = require("./routes/client/index_routes");

app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// setup flash + session
app.set("trust proxy", 1);

app.use(cookieParser("SLDFJAFLJGAKSJG"));

app.use(session({
  secret: process.env.SESSION_SECRET || "SLDFJAFLJGAKSJG",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.adminUser = req.session.adminUser || null;
  next();
});

app.use("/tinymce", express.static(path.join(__dirname, "node_modules", "tinymce")));
app.use(express.static(`${__dirname}/public`));

routeAdmin(app);
route(app);

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});