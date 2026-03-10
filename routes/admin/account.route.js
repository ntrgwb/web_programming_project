const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/account.controller");
const validate = require("../../validates/admin/account.validate");

router.get("/change-password", controller.changePassword);
router.post("/change-password", validate.changePasswordPost, controller.changePasswordPost);

module.exports = router;