const crypto = require("crypto");

const Order = require("../../model/order.model");
const Product = require("../../model/product_model");

const ensureBidderCode = (req) => {
  if (!req.session.bidderCode) {
    req.session.bidderCode = `ANON-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
  }

  return req.session.bidderCode;
};

const attachAuctionInfo = async (order) => {
  if (order.auction_id) {
    order.auctionInfo = await Product.findOne({ _id: order.auction_id });
    return order;
  }

  for (const item of order.products || []) {
    const product = await Product.findOne({ _id: item.product_id });
    item.productInfo = product || null;
    item.totalPrice = item.price * item.quantity;
  }

  return order;
};

// [GET] /orders
module.exports.index = async (req, res) => {
  try {
    const bidderCode = ensureBidderCode(req);
    const orderHistory = req.session.orderHistory || [];

    const orders = await Order.find({
      $or: [
        { bidderCode },
        { _id: { $in: orderHistory } }
      ]
    }).sort({ createdAt: -1 });

    for (const order of orders) {
      await attachAuctionInfo(order);
    }

    res.render("client/pages/orders/index", {
      PageTitle: "Phiên đã thắng",
      orders,
      bidderCode
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được danh sách phiên đã thắng.");
    return res.redirect("/");
  }
};

// [GET] /orders/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const bidderCode = ensureBidderCode(req);
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { bidderCode },
        { _id: { $in: req.session.orderHistory || [] } }
      ]
    });

    if (!order) {
      req.flash("error", "Không tìm thấy phiên thắng.");
      return res.redirect("/orders");
    }

    await attachAuctionInfo(order);

    res.render("client/pages/orders/detail", {
      PageTitle: "Chi tiết phiên thắng",
      order
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được chi tiết phiên thắng.");
    return res.redirect("/orders");
  }
};
