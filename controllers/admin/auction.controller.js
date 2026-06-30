const Auction = require("../../model/auction.model");

module.exports.index = async (req, res) => {
  const auctions = await Auction.find({
    status: "pending"
  }).sort({ createdAt: -1 });

  res.render("admin/pages/auctions/index", {
    pageTitle: "Duyệt phiên đấu giá",
    auctions
  });
};

module.exports.approve = async (req, res) => {
  const auction = await Auction.findOne({ _id: req.params.id });

  if (!auction) {
    return res.redirect("back");
  }

  auction.status = auction.startTime > new Date() ? "upcoming" : "active";
  await auction.save();

  res.redirect("/admin/auctions");
};

module.exports.reject = async (req, res) => {
  await Auction.updateOne(
    { _id: req.params.id },
    { status: "rejected" }
  );

  res.redirect("back");
};