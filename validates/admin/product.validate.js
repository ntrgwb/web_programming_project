const systemConfig = require("../../config/system");
const { parseVietnamDateTime } = require("../../helpers/dateTime");

module.exports.createPost = (req, res, next) => {
  if (!req.body.title) {
    req.flash("error", "Vui lòng nhập tiêu đề phiên đấu giá.");
    return res.redirect(`${systemConfig.prefixAdmin}/products/create`);
  }

  const startingPrice = parseInt(req.body.startingPrice || req.body.price, 10);
  if (Number.isNaN(startingPrice) || startingPrice < 0) {
    req.flash("error", "Giá khởi điểm không hợp lệ.");
    return res.redirect("back");
  }

  const startAt = parseVietnamDateTime(req.body.auctionStartAt, { defaultHour: 0, defaultMinute: 0 });
  const endAt = parseVietnamDateTime(req.body.auctionEndAt, { defaultHour: 23, defaultMinute: 59 });

  if (req.body.auctionStartAt && !startAt) {
    req.flash("error", "Thời gian bắt đầu phải có dạng dd/mm/yy hoặc dd/mm/yy HH:mm.");
    return res.redirect("back");
  }

  if (req.body.auctionEndAt && !endAt) {
    req.flash("error", "Thời gian kết thúc phải có dạng dd/mm/yy hoặc dd/mm/yy HH:mm.");
    return res.redirect("back");
  }

  if (startAt && endAt) {
    if (endAt <= startAt) {
      req.flash("error", "Thời gian kết thúc phải sau thời gian bắt đầu.");
      return res.redirect("back");
    }
  }

  next();
};
