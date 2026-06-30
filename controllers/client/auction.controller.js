const crypto = require("crypto");
const Auction = require("../../model/auction.model");
const Bid = require("../../model/bid.model");

function getBidderCode(req) {
  if (!req.session.bidderCode) {
    req.session.bidderCode = "BID-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  }
  return req.session.bidderCode;
}

async function syncAuctionStatus() {
  const now = new Date();

  await Auction.updateMany(
    { status: "upcoming", startTime: { $lte: now }, endTime: { $gt: now } },
    { status: "active" }
  );

  await Auction.updateMany(
    { status: { $in: ["upcoming", "active"] }, endTime: { $lte: now } },
    { status: "ended" }
  );
}

module.exports.index = async (req, res) => {
  await syncAuctionStatus();

  const auctions = await Auction.find({
    status: { $in: ["upcoming", "active", "ended"] }
  }).sort({ createdAt: -1 });

  res.render("client/pages/auctions/index", {
    pageTitle: "Đấu giá ẩn danh",
    auctions
  });
};

module.exports.create = (req, res) => {
  res.render("client/pages/auctions/create", {
    pageTitle: "Tạo phiên đấu giá",
    error: null
  });
};

module.exports.store = async (req, res) => {
  const creatorCode = getBidderCode(req);
  const creatorIp = req.ip;
  const now = new Date();

  const lastAuction = await Auction.findOne({
    $or: [{ creatorCode }, { creatorIp }]
  }).sort({ createdAt: -1 });

  if (lastAuction && now - lastAuction.createdAt < 10 * 60 * 1000) {
    return res.render("client/pages/auctions/create", {
      pageTitle: "Tạo phiên đấu giá",
      error: "Bạn tạo phiên quá nhanh, vui lòng thử lại sau 10 phút."
    });
  }

  const pendingCount = await Auction.countDocuments({
    $or: [{ creatorCode }, { creatorIp }],
    status: "pending"
  });

  if (pendingCount >= 3) {
    return res.render("client/pages/auctions/create", {
      pageTitle: "Tạo phiên đấu giá",
      error: "Bạn đang có 3 phiên chờ duyệt, không thể tạo thêm."
    });
  }

  const startPrice = Number(req.body.startPrice);
  const startTime = new Date(req.body.startTime);
  const endTime = new Date(req.body.endTime);

  if (
    !startPrice ||
    startPrice <= 0 ||
    isNaN(startTime.getTime()) ||
    isNaN(endTime.getTime()) ||
    endTime <= now ||
    endTime <= startTime
  ) {
    return res.render("client/pages/auctions/create", {
      pageTitle: "Tạo phiên đấu giá",
      error: "Giá khởi điểm hoặc thời gian không hợp lệ."
    });
  }

  await Auction.create({
    title: req.body.title,
    description: req.body.description,
    image: req.file ? `/uploads/${req.file.filename}` : "",
    startPrice,
    currentPrice: startPrice,
    startTime,
    endTime,
    status: "pending",
    creatorCode,
    creatorIp
  });

  res.redirect("/auctions");
};

module.exports.detail = async (req, res) => {
  await syncAuctionStatus();

  const auction = await Auction.findOne({
    _id: req.params.id,
    status: { $in: ["upcoming", "active", "ended"] }
  });

  if (!auction) return res.redirect("/auctions");

  const bids = await Bid.find({ auctionId: auction.id }).sort({
    amount: -1,
    createdAt: -1
  });

  res.render("client/pages/auctions/detail", {
    pageTitle: auction.title,
    auction,
    bids,
    bidderCode: getBidderCode(req),
    error: null
  });
};

module.exports.bid = async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.redirect("/auctions");

  const now = new Date();

  if (auction.status === "upcoming" && auction.startTime && auction.startTime <= now && auction.endTime > now) {
    await Auction.updateOne({ _id: auction.id }, { status: "active" });
    auction.status = "active";
  }

  if (auction.endTime <= now) {
    await Auction.updateOne({ _id: auction.id }, { status: "ended" });
    return res.redirect(`/auctions/${auction.id}`);
  }

  if (auction.status !== "active") {
    return res.redirect(`/auctions/${auction.id}`);
  }

  const amount = Number(String(req.body.amount).replace(/\D/g, ""));

  if (!amount || amount <= auction.currentPrice) {
    return res.redirect(`/auctions/${auction.id}`);
  }

  const bidderCode = getBidderCode(req);

  await Bid.create({
    auctionId: auction.id,
    bidderCode,
    amount
  });

  await Auction.updateOne(
    { _id: auction.id },
    {
      currentPrice: amount,
      highestBidderCode: bidderCode
    }
  );

  res.redirect(`/auctions/${auction.id}`);
};