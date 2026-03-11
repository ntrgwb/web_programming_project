const Product = require("../../model/product_model");
const Order = require("../../model/order.model");

// [GET] /checkout
module.exports.index = async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    req.flash("error", "Giỏ hàng đang trống!");
    return res.redirect("/cart");
  }

  let totalCartPrice = 0;

  for (const item of req.session.cart) {
    const product = await Product.findOne({
      _id: item.product_id,
      deleted: false,
      status: "active"
    });

    if (product) {
      totalCartPrice += product.price * item.quantity;
    }
  }

  res.render("client/pages/checkout/index", {
    pageTitle: "Thanh toán",
    totalCartPrice: totalCartPrice
  });
};

// [POST] /checkout/order
module.exports.orderPost = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;

    if (!req.session.cart || req.session.cart.length === 0) {
      req.flash("error", "Giỏ hàng đang trống!");
      return res.redirect("/cart");
    }

    const products = [];
    let totalPrice = 0;

    for (const item of req.session.cart) {
      const product = await Product.findOne({
        _id: item.product_id,
        deleted: false,
        status: "active"
      });

      if (product) {
        products.push({
          product_id: product.id,
          price: product.price,
          quantity: item.quantity
        });

        totalPrice += product.price * item.quantity;
      }
    }

    const order = new Order({
      customerInfo: {
        fullName,
        phone,
        address
      },
      products,
      totalPrice,
      status: "pending"
    });

    const newOrder = await order.save();

    // Lưu lịch sử đơn hàng vào session
    if (!req.session.orderHistory) {
      req.session.orderHistory = [];
    }

    req.session.orderHistory.push(newOrder.id);

    // Xóa cart sau khi đặt hàng
    req.session.cart = [];

    return res.redirect(`/checkout/success/${newOrder.id}`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Đặt hàng thất bại!");
    return res.redirect("/checkout");
  }
};

// [GET] /checkout/success/:id
module.exports.success = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({ _id: id });

    if (!order) {
      req.flash("error", "Đơn hàng không tồn tại!");
      return res.redirect("/products");
    }

    res.render("client/pages/checkout/success", {
      pageTitle: "Đặt hàng thành công",
      order: order
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tìm thấy đơn hàng!");
    return res.redirect("/products");
  }
};