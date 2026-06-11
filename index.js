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

app.use(bodyParser.json());

const systemConfig = require("./config/system");
const database = require("./config/database");
const { formatDateShort } = require("./helpers/dateTime");

const port = process.env.PORT || 3000;

database.connect();

const routeAdmin = require("./routes/admin/index_route");
const route = require("./routes/client/index_routes");

app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.formatDateShort = formatDateShort;
app.locals.formatDateTimeInput = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (number) => String(number).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

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
