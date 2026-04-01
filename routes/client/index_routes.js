const productsRoutes = require("./products_route") // require là một hàm được dùng để import các module khác vào file hiện tại
const homeRoutes = require("./home_routes");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const orderRoutes = require("./order.route");
const chatRoute = require("./chat.route");
module.exports = (app) => {
app.use("/", homeRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", orderRoutes);
app.use("/chat", chatRoute);

}