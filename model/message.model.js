const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    content: String
}, {
    timestamps: true
});

const Message = mongoose.model("Message", messageSchema, "messages");

module.exports = Message;