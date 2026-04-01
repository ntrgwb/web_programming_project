const Message = require("../../model/message.model");

module.exports.index = async (req, res) => {
    const messages = await Message.find().sort({ createdAt: 1 });

    res.render("admin/pages/chat/index", {
        messages
    });
};