const express = require("express")
const multer = require('multer');
const upload = multer();
const router = express.Router();
const controller = require("../../controllers/admin/product-category.controllers")
const uploadCloud = require("../../milddlewares/admin/uploadCloud.milddlewares")
const validate = require("../../validates/admin/product.validate");

router.get("/", controller.index);
router.get("/create", controller.create);

router.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);


module.exports = router;