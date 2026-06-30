const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/auction.controller");

router.get("/", controller.index);
router.post("/:id/approve", controller.approve);
router.post("/:id/reject", controller.reject);

module.exports = router;