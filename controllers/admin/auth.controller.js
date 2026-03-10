const bcrypt = require("bcryptjs");
const Account = require("../../model/account.model");

// [GET] /admin/auth/login
module.exports.login = (req, res) => {
  if (req.session.adminUser) {
    return res.redirect("/admin/dashboard");
  }

  res.render("admin/pages/auth/login", {
    pageTitle: "Đăng nhập admin"
  });
};

// [POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Account.findOne({
      email: email,
      deleted: false
    });

    if (!user) {
      req.flash("error", "Email không tồn tại!");
      return res.redirect("/admin/auth/login");
    }

    if (user.status !== "active") {
      req.flash("error", "Tài khoản đang bị khóa!");
      return res.redirect("/admin/auth/login");
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      req.flash("error", "Sai mật khẩu!");
      return res.redirect("/admin/auth/login");
    }

    req.session.adminUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    };

    req.flash("success", "Đăng nhập thành công!");
    return res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error);
    req.flash("error", "Đăng nhập thất bại!");
    return res.redirect("/admin/auth/login");
  }
};

// [GET] /admin/auth/logout
module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    return res.redirect("/admin/auth/login");
  });
};