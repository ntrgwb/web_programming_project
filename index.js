const express  = require("express");
const path = require("path");
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')


// load env variavles from .env file
require("dotenv").config(); 
// End load env variables


const app = express();


// override with post having ?_method=DELETE
app.use(methodOverride('_method'))


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


const systemConfig = require("./config/system");

// connect to database
const database = require("./config/database");

const port = process.env.PORT;

database.connect();

const routeAdmin = require("./routes/admin/index_route")
const route = require("./routes/client/index_routes");

app.locals.prefixAdmin = systemConfig.prefixAdmin;

// setup view engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug") // pug sẽ lấy các file trong thư mục views

// setup flash
app.use(cookieParser('SLDFJAFLJGAKSJG'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// End setup flash

//TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE

//Router
routeAdmin(app);
route(app);

app.use(express.static(`${__dirname}/public`)); // su dung thu muc public de chua cac file static nhu css, js, images

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});