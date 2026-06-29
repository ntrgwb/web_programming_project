const ADMIN_LEAVE_GRACE_MS = 1500;

const hasExpiredPendingLeave = (req) => {
  if (!req.session?.adminLeaveAt) return false;

  const leaveAt = Number(req.session.adminLeaveAt);
  if (!Number.isFinite(leaveAt)) return true;

  return Date.now() - leaveAt > ADMIN_LEAVE_GRACE_MS;
};

const redirectToLogin = (req, res) => {
  req.flash("error", "Bạn cần đăng nhập!");
  return res.redirect("/admin/auth/login");
};

const clearAdminSession = (req, callback) => {
  delete req.session.adminUser;
  delete req.session.adminLeaveAt;
  delete req.session.adminStayAt;
  req.session.save(callback);
};

const clearPendingLeave = (req, callback) => {
  if (!req.session.adminLeaveAt) return callback();

  delete req.session.adminLeaveAt;
  req.session.save(callback);
};

module.exports.requireAuth = (req, res, next) => {
  if (!req.session.adminUser) {
    return redirectToLogin(req, res);
  }

  if (hasExpiredPendingLeave(req)) {
    return clearAdminSession(req, () => redirectToLogin(req, res));
  }

  return clearPendingLeave(req, next);
};

module.exports.alreadyAuth = (req, res, next) => {
  if (!req.session.adminUser) {
    return next();
  }

  if (hasExpiredPendingLeave(req)) {
    return clearAdminSession(req, next);
  }

  return clearPendingLeave(req, () => res.redirect("/admin/dashboard"));
};
