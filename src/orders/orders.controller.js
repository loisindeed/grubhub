const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res) { // GET /orders
    const { orderId } = req.params;
    res.json({ data: orders.filter(orderId ? order => order.id == orderId : () => true) });
}

function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({
            status: 400,
            message: `Order must include a ${propertyName}`
        });
    };
}

function validateDishes(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (!Array.isArray(dishes) || dishes.length === 0) { // Check if dishes is an array
        return next({
            status: 400,
            message: "Order must include at least one dish"
        });
    }
    for (let index = 0; index < dishes.length; index++) {
        const dish = dishes[index];
        if (!Number.isInteger(dish.quantity) || dish.quantity <= 0) {
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0.`
            });
        }
    }
    next();
}

function create(req, res) { // POST /orders
    const { data: { deliverTo, mobileNumber, status = "pending", dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${orderId}`,
    });
}

function read(req, res, next) { // specific order
    res.json({ data: res.locals.order });
};

function validateStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (validStatus.includes(status)) {
        return next();
    }
    next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
}


function update(req, res, next) { // PUT /orders/:orderId
    const order = res.locals.order;
    const { orderId } = req.params;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    if (id && id !== orderId) { // if there is id in update and doesn't match
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
        });
    }
    if (order.status === "delivered") {
        return next( {
            status: 400,
            message: "A delivered order cannot be changed"
        })
    }
    // update the order
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
    res.json({ data: order });
}
function destroy(req, res, next) { // DELETE /orders/:orderId
    const { orderId } = req.params;
    const indexOfOrder = orders.findIndex(order => order.id === orderId);
    const order = orders[indexOfOrder];
    console.log(`Order ${order.id} is ${order.status}.`)
    if (order.status !== "pending") {
        return next({
            status: 400,
            message: `Order ${order.id} is ${order.status}. Only pending orders can be deleted.`
        });
    }
    orders.splice(indexOfOrder, 1);
    res.sendStatus(204);
}
module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        //bodyDataHas("status"),
        bodyDataHas("dishes"),
        validateDishes,
        create
    ],
    list,
    read: [orderExists, read],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        validateDishes,
        validateStatus,
        update
    ],
    delete: [orderExists, destroy]
};