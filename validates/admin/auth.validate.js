module.exports.loginPost = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    req.flash("error", "Vui lòng nhập email!");
    return res.redirect("/admin/auth/login");
  }

  if (!password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    return res.redirect("/admin/auth/login");
  }

  next();
};