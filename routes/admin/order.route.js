const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/order.controller");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.get("/change-status/:status/:id", controller.changeStatus);

module.exports = router;