const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    fullName: String,
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "active"
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Account = mongoose.model("Account", accountSchema, "accounts");

module.exports = Account;