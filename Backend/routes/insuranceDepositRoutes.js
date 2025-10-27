const Router = require("express").Router();
const controller = require("../controllers/insuranceDepositController");
const protectionMiddleware = require("../middlewares/protectionMiddleware");

Router.route("/")
  .get(protectionMiddleware, controller.list);

Router.route("/:id")
  .get(protectionMiddleware, controller.get);

Router.route("/:id/refund-full")
  .post(protectionMiddleware, controller.refundFull);

Router.route("/:id/refund-partial")
  .post(protectionMiddleware, controller.refundPartial);

Router.route("/:id/forfeit")
  .post(protectionMiddleware, controller.forfeit);

module.exports = Router;


