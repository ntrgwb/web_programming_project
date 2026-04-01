const Message = require("../../model/message.model");

module.exports.index = async (req, res) => {
    const userId = "USER_TEST";

    const messages = await Message.find({
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    }).sort({ createdAt: 1 });

    res.render("client/pages/chat/index", {
        messages
    });
};