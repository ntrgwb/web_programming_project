const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/auth.controller");
const validate = require("../../validates/admin/auth.validate");
const authMiddleware = require("../../milddlewares/admin/auth.middleware");

router.get("/login", authMiddleware.alreadyAuth, controller.login);
router.post("/login", authMiddleware.alreadyAuth, validate.loginPost, controller.loginPost);

router.get("/logout", authMiddleware.requireAuth, controller.logout);

module.exports = router;