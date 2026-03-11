const Order = require("../../model/order.model");
const Product = require("../../model/product_model");

// [GET] /admin/orders
module.exports.index = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    res.render("admin/pages/orders/index", {
      pageTitle: "Quản lý đơn hàng",
      orders: orders
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được danh sách đơn hàng!");
    res.redirect("/admin/dashboard");
  }
};

// [GET] /admin/orders/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({ _id: id });

    if (!order) {
      req.flash("error", "Đơn hàng không tồn tại!");
      return res.redirect("/admin/orders");
    }

    for (const item of order.products) {
      const product = await Product.findOne({
        _id: item.product_id
      });

      if (product) {
        item.productInfo = product;
        item.totalPrice = item.price * item.quantity;
      }
    }

    res.render("admin/pages/orders/detail", {
      pageTitle: "Chi tiết đơn hàng",
      order: order
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không xem được chi tiết đơn hàng!");
    return res.redirect("/admin/orders");
  }
};

// [GET] /admin/orders/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const id = req.params.id;

    await Order.updateOne(
      { _id: id },
      { status: status }
    );

    req.flash("success", "Cập nhật trạng thái đơn hàng thành công!");
    return res.redirect("/admin/orders");
  } catch (error) {
    console.log(error);
    req.flash("error", "Cập nhật trạng thái thất bại!");
    return res.redirect("/admin/orders");
  }
};