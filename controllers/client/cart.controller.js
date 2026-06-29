module.exports.addPost = (req, res) => {
  req.flash("error", "Trang này đã được thay bằng cơ chế đặt giá đấu giá.");
  return res.redirect("/products");
};

module.exports.index = (req, res) => {
  req.flash("error", "Trang này không còn dùng trong chế độ đấu giá.");
  return res.redirect("/products");
};

module.exports.delete = (req, res) => {
  return res.redirect("/products");
};

module.exports.update = (req, res) => {
  return res.redirect("/products");
};
