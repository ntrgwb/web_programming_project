const Order = require("../../model/order.model");
const Product = require("../../model/product_model");

const attachAuctionInfo = async (order) => {
  if (order.auction_id) {
    order.auctionInfo = await Product.findOne({ _id: order.auction_id });
    return order;
  }

  for (const item of order.products || []) {
    const product = await Product.findOne({ _id: item.product_id });
    if (product) {
      item.productInfo = product;
      item.totalPrice = item.price * item.quantity;
    }
  }

  return order;
};

// [GET] /admin/orders
module.exports.index = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    for (const order of orders) {
      await attachAuctionInfo(order);
    }

    res.render("admin/pages/orders/index", {
      pageTitle: "Quản lý thanh toán phiên thắng",
      orders
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được danh sách thanh toán.");
    res.redirect("/admin/dashboard");
  }
};

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id });

    if (!order) {
      req.flash("error", "Thanh toán không tồn tại.");
      return res.redirect("/admin/orders");
    }

    await attachAuctionInfo(order);

    res.render("admin/pages/orders/detail", {
      pageTitle: "Chi tiết thanh toán phiên thắng",
      order
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không xem được chi tiết thanh toán.");
    return res.redirect("/admin/orders");
  }
};

// [GET] /admin/orders/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    await Order.updateOne(
      { _id: req.params.id },
      { status: req.params.status }
    );

    req.flash("success", "Cập nhật trạng thái thanh toán thành công.");
    return res.redirect("/admin/orders");
  } catch (error) {
    console.log(error);
    req.flash("error", "Cập nhật trạng thái thất bại.");
    return res.redirect("/admin/orders");
  }
};
