const bcrypt = require("bcryptjs");
const Account = require("../../model/account.model");

// [GET] /admin/account/change-password
module.exports.changePassword = (req, res) => {
  res.render("admin/pages/account/change-password", {
    pageTitle: "Đổi mật khẩu"
  });
};

// [POST] /admin/account/change-password
module.exports.changePasswordPost = async (req, res) => {
  try {
    const adminUser = req.session.adminUser;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await Account.findOne({
      _id: adminUser.id,
      deleted: false,
      status: "active"
    });

    if (!user) {
      req.flash("error", "Tài khoản không tồn tại!");
      return res.redirect("/admin/account/change-password");
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);

    if (!isMatch) {
      req.flash("error", "Mật khẩu hiện tại không đúng!");
      return res.redirect("/admin/account/change-password");
    }

    if (newPassword !== confirmPassword) {
      req.flash("error", "Xác nhận mật khẩu không khớp!");
      return res.redirect("/admin/account/change-password");
    }

    const hashPassword = bcrypt.hashSync(newPassword, 10);

    await Account.updateOne(
      { _id: adminUser.id },
      { password: hashPassword }
    );

    req.flash("success", "Đổi mật khẩu thành công!");
    return res.redirect("/admin/account/change-password");
  } catch (error) {
    console.log(error);
    req.flash("error", "Đổi mật khẩu thất bại!");
    return res.redirect("/admin/account/change-password");
  }
};