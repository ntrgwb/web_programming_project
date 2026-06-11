const productsRoutes = require("./products_route");
const homeRoutes = require("./home_routes");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const orderRoutes = require("./order.route");
const chatRoute = require("./chat.route");

const clearAdminSessionOnClient = (req, res, next) => {
  if (req.session?.adminUser) {
    delete req.session.adminUser;
    res.locals.adminUser = null;
    return req.session.save(next);
  }

  next();
};

const clearAdminSessionOnHome = (req, res, next) => {
  if (req.path !== "/") return next();
  return clearAdminSessionOnClient(req, res, next);
};

module.exports = (app) => {
  app.use("/", clearAdminSessionOnHome, homeRoutes);
  app.use("/products", clearAdminSessionOnClient, productsRoutes);
  app.use("/cart", clearAdminSessionOnClient, cartRoutes);
  app.use("/checkout", clearAdminSessionOnClient, checkoutRoutes);
  app.use("/orders", clearAdminSessionOnClient, orderRoutes);
  app.use("/chat", clearAdminSessionOnClient, chatRoute);
};
