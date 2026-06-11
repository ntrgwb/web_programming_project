const crypto = require("crypto");

const Product = require("../../model/product_model");
const Order = require("../../model/order.model");

const EXCHANGE_RATE = 26312.4;

const ensureBidderCode = (req) => {
  if (!req.session.bidderCode) {
    req.session.bidderCode = `ANON-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
  }

  return req.session.bidderCode;
};

const getAuctionState = (auction) => {
  if (auction.auctionStatus === "cancelled") return "cancelled";
  if (auction.auctionEndAt && auction.auctionEndAt <= new Date()) return "ended";
  if (auction.auctionStartAt && auction.auctionStartAt > new Date()) return "upcoming";
  return "live";
};

const canCheckoutAuction = (auction, bidderCode) => (
  getAuctionState(auction) === "ended" &&
  auction.highestBidderCode === bidderCode &&
  (auction.currentPrice || auction.startingPrice || auction.price || 0) > 0
);

const buildExactCryptoAmount = async (totalPrice) => {
  const basePriceUSDT = Number((totalPrice / EXCHANGE_RATE).toFixed(2));
  let finalExactAmount = null;
  let isUnique = false;

  while (!isUnique) {
    const randomFraction = Math.floor(Math.random() * 999) + 1;
    finalExactAmount = basePriceUSDT + randomFraction / 1000000;

    const existingOrder = await Order.findOne({
      exact_amount: finalExactAmount,
      status: "pending"
    });

    if (!existingOrder) isUnique = true;
  }

  return finalExactAmount;
};

// [GET] /checkout?auction=:id
module.exports.index = async (req, res) => {
  const bidderCode = ensureBidderCode(req);
  const auctionId = req.query.auction;

  if (!auctionId) {
    req.flash("error", "Vui lòng chọn phiên đấu giá đã thắng để thanh toán.");
    return res.redirect("/products");
  }

  const auction = await Product.findOne({
    _id: auctionId,
    deleted: false
  });

  if (!auction || !canCheckoutAuction(auction, bidderCode)) {
    req.flash("error", "Bạn chỉ có thể thanh toán phiên đấu giá mình đã thắng.");
    return res.redirect("/products");
  }

  const existingOrder = await Order.findOne({
    auction_id: auction.id,
    bidderCode
  });

  if (existingOrder) {
    if (existingOrder.paymentMethod === "crypto" && existingOrder.status === "pending") {
      return res.redirect(`/checkout/crypto-payment/${existingOrder.id}`);
    }

    return res.redirect(`/checkout/success/${existingOrder.id}`);
  }

  res.render("client/pages/checkout/index", {
    PageTitle: "Thanh toán phiên thắng",
    auction,
    totalPrice: auction.currentPrice || auction.startingPrice || auction.price || 0
  });
};

// [POST] /checkout/order
module.exports.orderPost = async (req, res) => {
  try {
    const bidderCode = ensureBidderCode(req);
    const { fullName, phone, address, paymentMethod, auctionId } = req.body;

    const auction = await Product.findOne({
      _id: auctionId,
      deleted: false
    });

    if (!auction || !canCheckoutAuction(auction, bidderCode)) {
      req.flash("error", "Bạn không có quyền thanh toán phiên đấu giá này.");
      return res.redirect("/products");
    }

    const existingOrder = await Order.findOne({
      auction_id: auction.id,
      bidderCode
    });

    if (existingOrder) {
      return res.redirect(`/checkout/success/${existingOrder.id}`);
    }

    const totalPrice = auction.currentPrice || auction.startingPrice || auction.price || 0;
    const finalExactAmount = paymentMethod === "crypto"
      ? await buildExactCryptoAmount(totalPrice)
      : null;

    const order = new Order({
      customerInfo: {
        fullName,
        phone,
        address
      },
      auction_id: auction.id,
      bidderCode,
      winningBid: totalPrice,
      auctionSnapshot: {
        title: auction.title,
        thumbnail: auction.thumbnail,
        slug: auction.slug
      },
      products: [
        {
          product_id: auction.id,
          price: totalPrice,
          quantity: 1
        }
      ],
      totalPrice,
      exact_amount: finalExactAmount,
      paymentMethod,
      status: "pending"
    });

    const newOrder = await order.save();

    if (!req.session.orderHistory) {
      req.session.orderHistory = [];
    }

    req.session.orderHistory.push(newOrder.id);

    if (paymentMethod === "crypto") {
      return res.redirect(`/checkout/crypto-payment/${newOrder.id}`);
    }

    return res.redirect(`/checkout/success/${newOrder.id}`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Tạo thanh toán thất bại.");
    return res.redirect("/products");
  }
};

// [GET] /checkout/success/:id
module.exports.success = async (req, res) => {
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
      req.flash("error", "Không tìm thấy thanh toán.");
      return res.redirect("/products");
    }

    res.render("client/pages/checkout/success", {
      PageTitle: "Ghi nhận thanh toán",
      order
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tìm thấy thanh toán.");
    return res.redirect("/products");
  }
};

// [GET] /checkout/crypto-payment/:id
module.exports.cryptoPayment = async (req, res) => {
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
      req.flash("error", "Không tìm thấy thông tin thanh toán.");
      return res.redirect("/products");
    }

    res.render("client/pages/checkout/crypto-payment", {
      PageTitle: "Thanh toán phiên thắng bằng USDT",
      order
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tìm thấy thông tin thanh toán.");
    return res.redirect("/products");
  }
};
