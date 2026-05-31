const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/chat.controller");

router.get("/", controller.index);
router.post("/send", controller.send);

module.exports = router;