const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    auction_id: {
      type: String,
      required: true
    },
    bidderCode: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    bidderNote: String
  },
  {
    timestamps: true
  }
);

const Bid = mongoose.model("Bid", bidSchema, "bids");

module.exports = Bid;
