const router = require("express").Router({ mergeParams: true });
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/:orderId")
    .get(controller.read) // retrieve specific order
    .put(controller.update) // update specific order
    .delete(controller.delete) // delete specific order
    .all(methodNotAllowed);

router.route("/")
    .get(controller.list) // return list of all orders
    .post(controller.create) // create an order
    .all(methodNotAllowed);

module.exports = router;
