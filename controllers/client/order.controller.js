const Order = require("../../model/order.model");
const Product = require("../../model/product_model");

// [GET] /orders
module.exports.index = async (req, res) => {
  try {
    const orderHistory = req.session.orderHistory || [];

    if (orderHistory.length === 0) {
      return res.render("client/pages/orders/index", {
        pageTitle: "Đơn hàng của tôi",
        orders: []
      });
    }

    const orders = await Order.find({
      _id: { $in: orderHistory }
    }).sort({ createdAt: -1 });

    for (const order of orders) {
      for (const item of order.products) {
        const product = await Product.findOne({
          _id: item.product_id
        });

        if (product) {
          item.productInfo = product;
          item.totalPrice = item.price * item.quantity;
        } else {
          item.productInfo = null;
          item.totalPrice = item.price * item.quantity;
        }
      }
    }

    res.render("client/pages/orders/index", {
      pageTitle: "Đơn hàng của tôi",
      orders: orders
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được danh sách đơn hàng!");
    return res.redirect("/");
  }
};