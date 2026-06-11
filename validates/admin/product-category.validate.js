const systemConfig = require("../../config/system");

module.exports.createPost = (req, res, next) => {
  if (!req.body.title) {
    req.flash("error", "Vui lòng nhập tiêu đề danh mục.");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category/create`);
  }

  next();
};
