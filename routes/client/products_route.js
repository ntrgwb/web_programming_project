const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/products_controller")


router.get("/", controller.index );
router.post("/:id/bid", controller.bidPost);
router.get("/:slug", controller.detail );

module.exports = router;
