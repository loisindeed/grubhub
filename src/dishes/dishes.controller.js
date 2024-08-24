const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function bodyDataHas(propertyName) { //validate fields for create/update
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({
            status: 400,
            message: `Dish must include a ${propertyName}`
        });
    };
}

function priceValidation(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (typeof price === 'number' && price > 0) {
        return next();
    }
    next({
        status: 400,
        message: `Dish must have a price that is an integer greater than 0`,
    });
}

function list(req, res) { // GET /dishes
    const { dishId } = req.params;
    res.json({ data: dishes.filter(dishId ? dish => dish.id == dishId : () => true) });
}

function create(req, res) { // POST /dishes
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`,
    });
}

function read(req, res, next) { //specific dish
    res.json({ data: res.locals.dish });
};

function update(req, res, next) { // PUT /dishes/:dishId
    const dish = res.locals.dish;
    const { dishId } = req.params;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    if (id && id != dishId) { // if there is id in update and doesn't match
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        });
    }
    // update the dish
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.json({ data: dish });
}

module.exports = {
    list,
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceValidation,
        create
    ],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceValidation,
        update,
    ],
    read: [dishExists, read]
};