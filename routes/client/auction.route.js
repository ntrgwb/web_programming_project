const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const controller = require("../../controllers/client/auction.controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.get("/", controller.index);
router.get("/create", controller.create);
router.post("/create", upload.single("image"), controller.store);
router.get("/:id", controller.detail);
router.post("/:id/bid", controller.bid);

module.exports = router;