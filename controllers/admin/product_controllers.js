const Products = require("../../model/product_model")

const systemConfig = require("../../config/system");
const filterStatusHelpers = require("../../helpers/filterStatus")
const searchHelpers = require("../../helpers/search")
const paginationHelpers = require("../../helpers/pagination");
const { json } = require("body-parser");
const Product = require("../../model/product_model");


// [GET] /admin/products
module.exports.index = async (req, res) => {
    // console.log(req.query.status);
    const filterStatus = filterStatusHelpers(req.query);

    // console.log(filterStatus);

    let find = {
        deleted: false
    };

    if (req.query.status) {

        find.status = req.query.status
    }

    const objectSearch = searchHelpers(req.query);

    // console.log(objectSearch);


    if (objectSearch.regex) {

        find.title = objectSearch.regex;;
    }

    //Pagination
    const countProuducts = await Products.countDocuments(find);
    let objectPagination = paginationHelpers(
        {
            currentPage: 1,
            limitItems: 4
        },
        req.query,
        countProuducts
    );
    //End Pagination

    // Sort
    let sort = {};
     if(req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
     }
     else {
        sort.position = "desc"
     }
    // End Sort

    const products = await Products.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    res.render('admin/pages/products/index', {
        pageTitle: "Trang san pham",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
};

// [GET] admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    console.log(req.params);
    const status = req.params.status;
    const id = req.params.id;

    await Products.updateOne({ _id: id }, { status: status });

    req.flash("success", "Cập nhật trạng thái thành công");

    res.redirect("/admin/products");
};

// [PATCH] admin/products/change-multi  //Bai23
module.exports.changeMulti = async (req, res) => {
    const ids = req.body.ids.split(", ");
    const type = req.body.type;
    switch (type) {
        case "active":
            await Products.updateMany({ _id: { $in: ids } }, { status: "active" });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;
        case "inactive":
            await Products.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);
            break;

        case "delete-all":
            await Products.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
            req.flash("success", `Xóa sản phẩm thành công ${ids.length} sản phẩm`);
            break;
        case "change-position":
            console.log(ids);
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                console.log(id);
                console.log(position);
                await Products.updateOne({ _id: id }, { position: position });
            }
            req.flash("success", `Cập nhật vị trí thành công ${ids.length} sản phẩm`);
            break;

        default:
            break;

    }


    res.redirect("/admin/products");

};

// [PATCH] admin/products/delete/:id
module.exports.deletedItem = async (req, res) => {
    const id = req.params.id;

    // await Products.deleteOne({ _id: id });
    await Products.updateOne({ _id: id }, {
        deleted: true,
        deletedAt: new Date()
    });
    req.flash("success", `Xóa sản phẩm thành công sản phẩm ${id}`);

    res.redirect("/admin/products");


};

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/products/create", {
        pageTitle: "Thêm sản phẩm"
    });
};

// [POST] /admin/products/createPost
module.exports.createPost = async (req, res) => {

    req.body.price = parseInt(req.body.price) || 0;
    req.body.discountPercentage = parseInt(req.body.discountPercentage) || 0;
    req.body.stock = parseInt(req.body.stock) || 0;

    if (req.body.position == "" || isNaN(req.body.position)) {
        const countProducts = await Products.countDocuments();
        req.body.position = countProducts + 1;
    }
    else {
        req.body.position = parseInt(req.body.position);
    }

    const Product = new Products(req.body);
    await Product.save();

    req.flash("success", "Thêm sản phẩm thành công");

    res.redirect(`${systemConfig.prefixAdmin}/products`);
};


// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        res.render("admin/pages/products/edit", {
            pageTitle: "Chinh sua san pham",
            product: product
        })
    } catch (error) {
        req.flash("error", `Khong ton tai san pham nay!`);
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

};

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {

    const id = req.params.id;

    req.body.price = parseInt(req.body.price) || 0;
    req.body.discountPercentage = parseInt(req.body.discountPercentage) || 0;
    req.body.stock = parseInt(req.body.stock) || 0;

    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    try {
        await Product.updateOne({
            _id: req.params.id
        }, req.body)
        req.flash("success", "Cap nhat sản phẩm thành công");

    } catch {
        req.flash("error", "Cap nhat sản phẩm that bai!");

    }


    res.redirect(`${systemConfig.prefixAdmin}/products`);


};

// [GET] /admin/products/detail/:id

module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);

        res.render("admin/pages/products/detail", {
            pageTitle: product.title,
            product: product
        })
    } catch (error) {
        req.flash("error", `Khong ton tai san pham nay!`);
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }

};