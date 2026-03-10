module.exports.requireAuth = (req, res, next) => {
  if (!req.session.adminUser) {
    req.flash("error", "Bạn cần đăng nhập!");
    return res.redirect("/admin/auth/login");
  }

  next();
};

module.exports.alreadyAuth = (req, res, next) => {
  if (req.session.adminUser) {
    return res.redirect("/admin/dashboard");
  }

  next();
};