const Message = require("../../model/message.model");

module.exports.index = async (req, res) => {
  const messages = await Message.find({}).sort({ createdAt: 1 });

  res.render("admin/pages/chat/index", {
    pageTitle: "Chat với Khách Hàng",
    messages
  });
};

module.exports.send = async (req, res) => {
  const { content } = req.body;

  if (content && content.trim() !== "") {
    await Message.create({
      role: "admin",
      content: content.trim()
    });
  }

  res.redirect("/admin/chat");
};