const express = require("express")
const multer = require('multer');
const upload = multer();
const router = express.Router();
const controller = require("../../controllers/admin/product-category.controllers")
const uploadCloud = require("../../milddlewares/admin/uploadCloud.milddlewares")
const validate = require("../../validates/admin/product-category.validate");

router.get("/", controller.index);
router.get("/create", controller.create);
router.get("/detail/:id", controller.detail);
router.get("/edit/:id", controller.edit);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.deletedItem);

router.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

router.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.editPatch
);


module.exports = router;
