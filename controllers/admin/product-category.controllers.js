const ProductCategory = require("../../model/product-category.model");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");

const parsePosition = async (position) => {
  if (position == "" || isNaN(position)) {
    const countProducts = await ProductCategory.countDocuments();
    return countProducts + 1;
  }

  return parseInt(position, 10);
};

const getDescendantIds = (records, parentId) => {
  const ids = [];

  records.forEach((record) => {
    if (record.parent_id === parentId) {
      ids.push(record.id);
      ids.push(...getDescendantIds(records, record.id));
    }
  });

  return ids;
};

// [GET] /admin/product-category
module.exports.index = async (req, res) => {
  const records = await ProductCategory.find({ deleted: false });
  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục tài sản đấu giá",
    records: newRecords
  });
};

// [GET] /admin/product-category/create
module.exports.create = async (req, res) => {
  const records = await ProductCategory.find({ deleted: false });
  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục tài sản đấu giá",
    records: newRecords
  });
};

// [POST] /admin/product-category/create
module.exports.createPost = async (req, res) => {
  req.body.position = await parsePosition(req.body.position);

  const record = new ProductCategory(req.body);
  await record.save();

  req.flash("success", "Tạo danh mục tài sản thành công.");
  res.redirect(`${systemConfig.prefixAdmin}/product-category`);
};

// [GET] /admin/product-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const record = await ProductCategory.findOne({
      _id: req.params.id,
      deleted: false
    });

    if (!record) {
      req.flash("error", "Danh mục tài sản không tồn tại.");
      return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
    }

    const parent = record.parent_id
      ? await ProductCategory.findOne({ _id: record.parent_id, deleted: false })
      : null;

    res.render("admin/pages/products-category/detail", {
      pageTitle: record.title,
      record,
      parent
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được chi tiết danh mục.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  }
};

// [GET] /admin/product-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const record = await ProductCategory.findOne({
      _id: req.params.id,
      deleted: false
    });

    if (!record) {
      req.flash("error", "Danh mục tài sản không tồn tại.");
      return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
    }

    const records = await ProductCategory.find({
      deleted: false,
      _id: { $ne: req.params.id }
    });
    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/products-category/edit", {
      pageTitle: "Cập nhật danh mục tài sản",
      record,
      records: newRecords
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Không tải được danh mục tài sản.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  }
};

// [PATCH] /admin/product-category/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const record = await ProductCategory.findOne({
      _id: req.params.id,
      deleted: false
    });

    if (!record) {
      req.flash("error", "Danh mục tài sản không tồn tại.");
      return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
    }

    req.body.position = await parsePosition(req.body.position);

    if (!req.body.thumbnail) {
      delete req.body.thumbnail;
    }

    if (req.body.parent_id === req.params.id) {
      req.body.parent_id = "";
    }

    await ProductCategory.updateOne({ _id: req.params.id }, req.body);

    req.flash("success", "Cập nhật danh mục tài sản thành công.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Cập nhật danh mục tài sản thất bại.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  }
};

// [PATCH] /admin/product-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    await ProductCategory.updateOne(
      { _id: req.params.id },
      { status: req.params.status }
    );

    req.flash("success", "Cập nhật trạng thái danh mục thành công.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Cập nhật trạng thái danh mục thất bại.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  }
};

// [DELETE] /admin/product-category/delete/:id
module.exports.deletedItem = async (req, res) => {
  try {
    const records = await ProductCategory.find({ deleted: false });
    const ids = [req.params.id, ...getDescendantIds(records, req.params.id)];

    await ProductCategory.updateMany(
      { _id: { $in: ids } },
      {
        deleted: true,
        deletedAt: new Date()
      }
    );

    req.flash("success", "Xóa danh mục tài sản thành công.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Xóa danh mục tài sản thất bại.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  }
};
