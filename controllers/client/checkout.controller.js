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
    const { fullName, phone, address, paymentMethod } = req.body;

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

    // 2. Tính tiền USDT và chuẩn bị biến số lẻ
    let finalExactAmount = null;

    // Tách luồng: Khách chọn Crypto thì cộng thêm số lẻ vào thẳng totalPrice
    if (paymentMethod === "crypto") {
      // Cập nhật tỷ giá mới nhất
      const EXCHANGE_RATE = 26312.40;

      // 1. Đổi VNĐ sang USDT (Ví dụ: 20.000 / 25000 = 0.8 USDT)
      // Dùng toFixed(2) rồi ép kiểu Number để lấy 2 số thập phân (0.80)
      const basePriceUSDT = Number((totalPrice / EXCHANGE_RATE).toFixed(2));

      let isUnique = false;
      while (!isUnique) {
        const randomFraction = Math.floor(Math.random() * 999) + 1;
        
        // 2. Cộng số lẻ vào tiền Đô (0.76 + 0.000285 = 0.760285 USDT)
        finalExactAmount = basePriceUSDT + (randomFraction / 1000000); 
        
        const existingOrder = await Order.findOne({ 
          exact_amount: finalExactAmount, status: 'pending' 
        });
        
        if (!existingOrder) 
          isUnique = true;
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
      exact_amount: finalExactAmount,
      paymentMethod,
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

    // Điều hướng
    if (paymentMethod === "crypto")
      return res.redirect(`/checkout/crypto-payment/${newOrder.id}`); 
    else
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

// [GET] /checkout/crypto-payment/:id
module.exports.cryptoPayment = async (req, res) => {
  try {
    const id = req.params.id;

    // Tìm đơn hàng dựa trên ID từ URL
    const order = await Order.findOne({ _id: id });

    if (!order) {
      req.flash("error", "Đơn hàng không tồn tại!");
      return res.redirect("/products");
    }

    // Render ra file giao diện thanh toán Crypto và truyền thông tin đơn hàng sang
    res.render("client/pages/checkout/crypto-payment", {
      pageTitle: "Thanh toán đơn hàng bằng USDT",
      order: order
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tìm thấy thông tin thanh toán!");
    return res.redirect("/products");
  }
};