const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productSchema = new mongoose.Schema({

    title: String,
    description: String,
    // Legacy sale fields are kept so old records can still render during migration.
    price: Number,
    discountPercentage: Number,
    stock: Number,
    startingPrice: {
        type: Number,
        default: 0
    },
    currentPrice: {
        type: Number,
        default: 0
    },
    bidStep: {
        type: Number,
        default: 10000
    },
    bidCount: {
        type: Number,
        default: 0
    },
    highestBidId: String,
    highestBidderCode: String,
    auctionStartAt: Date,
    auctionEndAt: Date,
    auctionStatus: {
        type: String,
        enum: ["draft", "upcoming", "live", "ended", "cancelled"],
        default: "live"
    },
    thumbnail: String,
    status: String,
    position: Number,
    slug: { 
        type: String, 
        slug: "title",
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
        
}, {
    timestamps: true
})

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
