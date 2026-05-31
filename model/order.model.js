const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerInfo: {
      fullName: String,
      phone: String,
      address: String
    },
    products: [
      {
        product_id: String,
        price: Number,
        quantity: Number
      }
    ],
    totalPrice: Number,
    exact_amount: Number, // Số lẻ nhận diện (Ví dụ: 10.000142)
    tx_id: { 
      type: String, 
      default: null 
    }, // Mã giao dịch Blockchain để làm bằng chứng
    paymentMethod: { 
      type: String, 
      default: "cod" 
    },
    status: {
      type: String,
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;