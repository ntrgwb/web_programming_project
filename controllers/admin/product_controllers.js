const Product = require("../../model/product_model");
const Bid = require("../../model/bid.model");
const systemConfig = require("../../config/system");
const filterStatusHelpers = require("../../helpers/filterStatus");
const searchHelpers = require("../../helpers/search");
const paginationHelpers = require("../../helpers/pagination");
const { parseVietnamDateTime } = require("../../helpers/dateTime");

const parseNumber = (value, fallback = 0) => {
  const number = parseInt(value, 10);
  return Number.isNaN(number) ? fallback : number;
};

const normalizeStatus = (status) => {
  if (status === "1") return "active";
  if (status === "0") return "inactive";
  return status || "active";
};

const normalizeAuctionStatus = (status) => status || "live";

const normalizeAuctionBody = (body, existingProduct = null) => {
  const startingPrice = parseNumber(body.startingPrice || body.price, existingProduct?.startingPrice || 0);
  const currentPrice = existingProduct?.bidCount > 0
    ? existingProduct.currentPrice
    : parseNumber(body.currentPrice, existingProduct?.currentPrice || startingPrice);

  return {
    title: body.title,
    description: body.description,
    startingPrice,
    currentPrice,
    bidStep: parseNumber(body.bidStep, existingProduct?.bidStep || 10000),
    auctionStartAt: parseVietnamDateTime(body.auctionStartAt, { defaultHour: 0, defaultMinute: 0 }),
    auctionEndAt: parseVietnamDateTime(body.auctionEndAt, { defaultHour: 23, defaultMinute: 59 }),
    auctionStatus: normalizeAuctionStatus(body.auctionStatus),
    price: startingPrice,
    discountPercentage: 0,
    stock: 1,
    status: normalizeStatus(body.status),
    position: parseNumber(body.position, existingProduct?.position || 0)
  };
};

const getAuctionState = (product) => {
  if (product.auctionStatus === "cancelled") return "cancelled";
  if (product.auctionStatus === "draft") return "draft";

  const now = new Date();
  if (product.auctionEndAt && product.auctionEndAt <= now) return "ended";
  if (product.auctionStartAt && product.auctionStartAt > now) return "upcoming";

  return "live";
};

const decorateAuction = (product) => {
  const auction = product.toObject ? product.toObject() : product;
  auction.id = product.id || product._id?.toString();
  auction.auctionState = getAuctionState(product);
  auction.currentPrice = product.currentPrice || product.startingPrice || product.price || 0;
  auction.startingPrice = product.startingPrice || product.price || 0;
  auction.bidStep = product.bidStep || 10000;
  return auction;
};

// [GET] /admin/products
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelpers(req.query);

  const find = {
    deleted: false
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  const objectSearch = searchHelpers(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  const countProducts = await Product.countDocuments(find);
  const objectPagination = paginationHelpers(
    {
      currentPage: 1,
      limitItems: 4
    },
    req.query,
    countProducts
  );

  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }

  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  res.render("admin/pages/products/index", {
    pageTitle: "Quản lý phiên đấu giá",
    products: products.map(decorateAuction),
    filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination
  });
};

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status });

  req.flash("success", "Cập nhật trạng thái thành công.");
  res.redirect("/admin/products");
};

// [PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const ids = req.body.ids.split(", ");
  const type = req.body.type;

  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash("success", `Đã bật ${ids.length} phiên đấu giá.`);
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      req.flash("success", `Đã tắt ${ids.length} phiên đấu giá.`);
      break;
    case "delete-all":
      await Product.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
      req.flash("success", `Đã xóa ${ids.length} phiên đấu giá.`);
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position, 10);
        await Product.updateOne({ _id: id }, { position });
      }
      req.flash("success", `Đã cập nhật vị trí ${ids.length} phiên đấu giá.`);
      break;
    default:
      break;
  }

  res.redirect("/admin/products");
};

// [DELETE] /admin/products/delete/:id
module.exports.deletedItem = async (req, res) => {
  const id = req.params.id;

  await Product.updateOne({ _id: id }, {
    deleted: true,
    deletedAt: new Date()
  });

  req.flash("success", "Đã xóa phiên đấu giá.");
  res.redirect("/admin/products");
};

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/products/create", {
    pageTitle: "Tạo phiên đấu giá"
  });
};

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  const body = normalizeAuctionBody(req.body);

  if (!body.position) {
    const countProducts = await Product.countDocuments();
    body.position = countProducts + 1;
  }

  if (req.body.thumbnail) {
    body.thumbnail = req.body.thumbnail;
  }

  const product = new Product(body);
  await product.save();

  req.flash("success", "Tạo phiên đấu giá thành công.");
  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const product = await Product.findOne({
      deleted: false,
      _id: req.params.id
    });

    if (!product) {
      req.flash("error", "Phiên đấu giá không tồn tại.");
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    res.render("admin/pages/products/edit", {
      pageTitle: "Chỉnh sửa phiên đấu giá",
      product: decorateAuction(product)
    });
  } catch (error) {
    req.flash("error", "Không tải được phiên đấu giá.");
    return res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const product = await Product.findOne({
      deleted: false,
      _id: req.params.id
    });

    if (!product) {
      req.flash("error", "Phiên đấu giá không tồn tại.");
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    const body = normalizeAuctionBody(req.body, product);

    if (req.body.thumbnail) {
      body.thumbnail = req.body.thumbnail;
    }

    await Product.updateOne({ _id: req.params.id }, body);
    req.flash("success", "Cập nhật phiên đấu giá thành công.");
  } catch (error) {
    console.log(error);
    req.flash("error", "Cập nhật phiên đấu giá thất bại.");
  }

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const product = await Product.findOne({
      deleted: false,
      _id: req.params.id
    });

    if (!product) {
      req.flash("error", "Phiên đấu giá không tồn tại.");
      return res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

    const bids = await Bid.find({ auction_id: product.id })
      .sort({ amount: -1, createdAt: -1 })
      .limit(50);

    res.render("admin/pages/products/detail", {
      pageTitle: product.title,
      product: decorateAuction(product),
      bids
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được chi tiết phiên đấu giá.");
    return res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
