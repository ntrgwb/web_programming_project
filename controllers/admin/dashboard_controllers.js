const Product = require("../../model/product_model");
const ProductCategory = require("../../model/product-category.model");
const Order = require("../../model/order.model");
const Account = require("../../model/account.model");
const Bid = require("../../model/bid.model");

module.exports.dashboard = async (req, res) => {
  const totalProduct = await Product.countDocuments({ deleted: false });
  const totalCategory = await ProductCategory.countDocuments({ deleted: false });
  const totalOrder = await Order.countDocuments();
  const totalAccount = await Account.countDocuments({ deleted: false });
  const totalBid = await Bid.countDocuments();

  const latestOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5);

  const latestProducts = await Product.find({ deleted: false })
    .sort({ createdAt: -1 })
    .limit(5);

  res.render("admin/pages/dashboard/index", {
    pageTitle: "Trang tổng quan",
    totalProduct,
    totalCategory,
    totalOrder,
    totalBid,
    totalAccount,
    latestOrders,
    latestProducts
  });
};
