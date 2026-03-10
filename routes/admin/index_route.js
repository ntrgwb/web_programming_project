const systemConfig = require("../../config/system");

const dashboardRoutes = require("./dashboard_route");
const productRouter = require("./product_router");
const productCategoryRouters = require("./product-category.route");
const authRoutes = require("./auth.route");
const accountRoutes = require("./account.route");

const authMiddleware = require("../../milddlewares/admin/auth.middleware");

module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use(PATH_ADMIN + "/auth", authRoutes);

  app.use(PATH_ADMIN + "/dashboard", authMiddleware.requireAuth, dashboardRoutes);
  app.use(PATH_ADMIN + "/products", authMiddleware.requireAuth, productRouter);
  app.use(PATH_ADMIN + "/product-category", authMiddleware.requireAuth, productCategoryRouters);
  app.use(PATH_ADMIN + "/account", authMiddleware.requireAuth, accountRoutes);
};