require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Account = require("./model/account.model");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // xóa admin cũ
    await Account.deleteMany({ email: "admin@gmail.com" });

    const hashPassword = bcrypt.hashSync("123456", 10);

    const account = new Account({
      fullName: "Super Admin",
      email: "admin@gmail.com",
      password: hashPassword,
      status: "active",
      deleted: false
    });

    await account.save();

    console.log("Tạo admin mới thành công");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seedAdmin();