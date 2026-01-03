const express = require("express");
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
// const storageMulter = require("../../helpers/storageMulter");
const upload = multer();
const router = express.Router();
const controller = require("../../controllers/admin/product_controllers")
const validate = require("../../validates/admin/product.validate");

const uploadCloud = require("../../milddlewares/admin/uploadCloud.milddlewares")

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deletedItem);

router.get("/create", controller.create);

router.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id",
    upload.single('thumbnail'),
    validate.createPost,
    controller.editPatch);


router.get("/detail/:id", controller.detail);


module.exports = router;
