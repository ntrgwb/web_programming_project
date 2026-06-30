const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,

    startPrice: {
      type: Number,
      required: true
    },

    currentPrice: {
      type: Number,
      required: true
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "upcoming", "active", "ended", "rejected"],
      default: "pending"
    },

    highestBidderCode: String,
    creatorCode: String,
    creatorIp: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Auction", auctionSchema);