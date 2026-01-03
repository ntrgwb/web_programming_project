const productsRoutes = require("./products_route") // require là một hàm được dùng để import các module khác vào file hiện tại
const homeRoutes = require("./home_routes");
module.exports = (app) => {
app.use("/", homeRoutes);

app.use("/products", productsRoutes);

}