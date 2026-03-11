const Product = require("../../model/product_model");

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity) || 1;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const existProduct = req.session.cart.find(item => item.product_id === productId);

  if (existProduct) {
    existProduct.quantity += quantity;
  } else {
    req.session.cart.push({
      product_id: productId,
      quantity: quantity
    });
  }

  req.flash("success", "Đã thêm sản phẩm vào giỏ hàng!");
  return res.redirect("/cart");
};

// [GET] /cart
module.exports.index = async (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }

  const cart = req.session.cart;

  for (const item of cart) {
    const product = await Product.findOne({
      _id: item.product_id,
      deleted: false,
      status: "active"
    });

    if (product) {
      item.productInfo = product;
      item.totalPrice = product.price * item.quantity;
    }
  }

  let totalCartPrice = 0;
  cart.forEach(item => {
    totalCartPrice += item.totalPrice || 0;
  });

  res.render("client/pages/cart/index", {
    pageTitle: "Giỏ hàng",
    cartDetail: cart,
    totalCartPrice: totalCartPrice
  });
};

// [GET] /cart/delete/:productId
module.exports.delete = (req, res) => {
  const productId = req.params.productId;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart = req.session.cart.filter(item => item.product_id !== productId);

  req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");
  return res.redirect("/cart");
};

// [POST] /cart/update/:productId
module.exports.update = (req, res) => {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const product = req.session.cart.find(item => item.product_id === productId);

  if (product && quantity > 0) {
    product.quantity = quantity;
  }

  req.flash("success", "Cập nhật giỏ hàng thành công!");
  return res.redirect("/cart");
};