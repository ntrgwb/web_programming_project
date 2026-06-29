const crypto = require("crypto");

const Product = require("../../model/product_model");
const Bid = require("../../model/bid.model");

const formatBidder = (code) => {
  if (!code) return "ANON-UNKNOWN";
  return `${code.slice(0, 6)}...${code.slice(-4)}`;
};

const ensureBidderCode = (req) => {
  if (!req.session.bidderCode) {
    req.session.bidderCode = `ANON-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
  }

  return req.session.bidderCode;
};

const getBasePrice = (product) => product.startingPrice || product.price || 0;

const getCurrentPrice = (product) => product.currentPrice || getBasePrice(product);

const getAuctionState = (product) => {
  if (product.auctionStatus === "cancelled") return "cancelled";
  if (product.auctionStatus === "draft") return "draft";

  const now = new Date();
  if (product.auctionEndAt && product.auctionEndAt <= now) return "ended";
  if (product.auctionStartAt && product.auctionStartAt > now) return "upcoming";

  return "live";
};

const decorateAuction = (product, bidderCode = "") => {
  const auction = product.toObject ? product.toObject() : product;
  auction.id = product.id || product._id?.toString();
  const state = getAuctionState(product);
  const basePrice = getBasePrice(product);
  const currentPrice = getCurrentPrice(product);
  const bidStep = product.bidStep || 10000;
  const hasBid = (product.bidCount || 0) > 0 || currentPrice > basePrice;

  auction.auctionState = state;
  auction.isLive = state === "live";
  auction.isEnded = state === "ended";
  auction.currentPrice = currentPrice;
  auction.startingPrice = basePrice;
  auction.bidStep = bidStep;
  auction.minBid = hasBid ? currentPrice + bidStep : basePrice;
  auction.highestBidderMasked = formatBidder(product.highestBidderCode);
  auction.isCurrentBidderWinner = state === "ended" && product.highestBidderCode === bidderCode;

  return auction;
};

// [GET] /products
module.exports.index = async (req, res) => {
  const bidderCode = ensureBidderCode(req);

  const products = await Product.find({
    status: "active",
    deleted: false
  }).sort({ auctionEndAt: 1, position: "desc" });

  res.render("client/pages/products/index", {
    PageTitle: "Danh sách phiên đấu giá",
    products: products.map((item) => decorateAuction(item, bidderCode)),
    bidderCode
  });
};

// [GET] /products/:slug
module.exports.detail = async (req, res) => {
  try {
    const bidderCode = ensureBidderCode(req);
    const product = await Product.findOne({
      deleted: false,
      slug: req.params.slug,
      status: "active"
    });

    if (!product) {
      req.flash("error", "Phiên đấu giá không tồn tại.");
      return res.redirect("/products");
    }

    const bids = await Bid.find({ auction_id: product.id })
      .sort({ amount: -1, createdAt: -1 })
      .limit(20);

    res.render("client/pages/products/detail", {
      PageTitle: product.title,
      product: decorateAuction(product, bidderCode),
      bids: bids.map((bid) => ({
        ...bid.toObject(),
        bidderMasked: formatBidder(bid.bidderCode),
        isMine: bid.bidderCode === bidderCode
      })),
      bidderCode
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được phiên đấu giá.");
    return res.redirect("/products");
  }
};

// [POST] /products/:id/bid
module.exports.bidPost = async (req, res) => {
  try {
    const bidderCode = ensureBidderCode(req);
    const amount = parseInt(req.body.amount, 10);

    const product = await Product.findOne({
      _id: req.params.id,
      deleted: false,
      status: "active"
    });

    if (!product) {
      req.flash("error", "Phiên đấu giá không tồn tại.");
      return res.redirect("/products");
    }

    const auction = decorateAuction(product, bidderCode);

    if (!auction.isLive) {
      req.flash("error", "Phiên đấu giá này hiện không nhận đặt giá.");
      return res.redirect(`/products/${product.slug}`);
    }

    if (!amount || amount < auction.minBid) {
      req.flash("error", `Giá đặt tối thiểu là ${auction.minBid.toLocaleString("vi-VN")}đ.`);
      return res.redirect(`/products/${product.slug}`);
    }

    const bid = new Bid({
      auction_id: product.id,
      bidderCode,
      amount
    });

    await bid.save();

    await Product.updateOne(
      { _id: product.id },
      {
        $set: {
          currentPrice: amount,
          highestBidId: bid.id,
          highestBidderCode: bidderCode,
          auctionStatus: "live"
        },
        $inc: { bidCount: 1 }
      }
    );

    req.flash("success", "Đặt giá thành công.");
    return res.redirect(`/products/${product.slug}`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Đặt giá thất bại.");
    return res.redirect("/products");
  }
};
