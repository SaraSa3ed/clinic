const Router = require("express").Router();
const productController = require("../controllers/productController");
const { dynamicUpload, uploadFilesLocally } = require("../middlewares/fileUpload");
const protectionMiddleware = require("../middlewares/protectionMiddleware");

// Product routes
Router.route("/")
  .get(productController.getAllProducts)
  .post(
    protectionMiddleware,
    dynamicUpload(["image_url"]),
    async (req, res, next) => {
      try {
        const files = await uploadFilesLocally(req.files, ["image_url"]);
        if (files && files.length > 0) {
          req.body.image_url = files[0].link;
        }
        next();
      } catch (e) {
        next(e);
      }
    },
    productController.createProduct
  );

// Search products route
Router.route("/search").get(productController.searchProducts);

Router.route("/:id")
  .get(productController.getProduct)
  .patch(
    protectionMiddleware,
    dynamicUpload(["image_url"]),
    async (req, res, next) => {
      try {
        const files = await uploadFilesLocally(req.files, ["image_url"]);
        if (files && files.length > 0) {
          req.body.image_url = files[0].link;
        }
        next();
      } catch (e) {
        next(e);
      }
    },
    productController.updateProduct
  )
  .delete(productController.deleteProduct);

// Update product stock directly
Router.route("/:id/stock").patch(productController.updateProductStock);

module.exports = Router;
