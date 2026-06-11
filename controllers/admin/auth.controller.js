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
    delete req.session.adminLeaveAt;
    delete req.session.adminStayAt;

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

// [POST] /admin/auth/leave-admin
module.exports.leaveAdmin = (req, res) => {
  if (!req.session) {
    return res.sendStatus(204);
  }

  if (!req.session.adminUser) {
    return res.sendStatus(204);
  }

  const leftAt = Number(req.query.leftAt || req.body?.leftAt || Date.now());
  const lastStayAt = Number(req.session.adminStayAt || 0);

  if (!Number.isFinite(leftAt) || leftAt > lastStayAt) {
    req.session.adminLeaveAt = Number.isFinite(leftAt) ? leftAt : Date.now();
  }

  req.session.save(() => res.sendStatus(204));
};

// [POST] /admin/auth/stay-admin
module.exports.stayAdmin = (req, res) => {
  if (!req.session) {
    return res.sendStatus(204);
  }

  const stayAt = Number(req.query.stayAt || req.body?.stayAt || Date.now());
  if (Number.isFinite(stayAt)) {
    req.session.adminStayAt = Math.max(Number(req.session.adminStayAt || 0), stayAt);

    const leaveAt = Number(req.session.adminLeaveAt || 0);
    if (!leaveAt || leaveAt <= stayAt) {
      delete req.session.adminLeaveAt;
    }
  }

  req.session.save(() => res.sendStatus(204));
};
