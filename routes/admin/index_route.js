const systemConfig = require("../../config/system")

const dashboardRoutes = require("./dashboard_route") // require là một hàm được dùng để import các module khác vào file hiện tại
const productRouter = require("./product_router")
const productCategoryRouters = require("./product-category.route")

module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(PATH_ADMIN + "/dashboard", dashboardRoutes);
    app.use(PATH_ADMIN + "/products", productRouter);
    app.use(PATH_ADMIN + "/product-category", productCategoryRouters);
} 