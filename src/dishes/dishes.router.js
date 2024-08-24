const router = require("express").Router({ mergeParams: true });
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/:dishId")
    .get(controller.read) // retrieve specific dish
    .put(controller.update) // update specific dish
    .all(methodNotAllowed);

router.route("/")
    .get(controller.list) // return list of all
    .post(controller.create) // create a dish
    .all(methodNotAllowed);

module.exports = router;
