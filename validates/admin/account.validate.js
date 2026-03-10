module.exports.changePasswordPost = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    req.flash("error", "Vui lòng nhập mật khẩu hiện tại!");
    return res.redirect("/admin/account/change-password");
  }

  if (!newPassword) {
    req.flash("error", "Vui lòng nhập mật khẩu mới!");
    return res.redirect("/admin/account/change-password");
  }

  if (newPassword.length < 6) {
    req.flash("error", "Mật khẩu mới phải từ 6 ký tự!");
    return res.redirect("/admin/account/change-password");
  }

  if (!confirmPassword) {
    req.flash("error", "Vui lòng xác nhận mật khẩu mới!");
    return res.redirect("/admin/account/change-password");
  }

  next();
};